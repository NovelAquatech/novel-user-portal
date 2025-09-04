import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import styles from './SwitchComponent.module.css';
import { Button } from '@mui/material';
import { toast } from 'react-hot-toast';
import { useEffect, useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { getValveSettings, setValveSettings } from '../helper/web-service';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ValvePressure from './ValvePressure';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CachedIcon from '@mui/icons-material/Cached';

const SwitchComponent = ({ devices, autoLogin }) => {
  const [saveLoading, setSaveLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [dateTime, setDateTime] = useState(
    dayjs().format('YYYY-MM-DD HH:mm:ss')
  );

  const [editedRows, setEditedRows] = useState(new Set());

  const markRowEdited = (rowKey) => {
    setEditedRows((prev) => new Set(prev).add(rowKey));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const getDeviceName = (uid) => {
    return devices[uid] || '';
  };

  const fetchDeviceSettings = async () => {
    const apiUrl = getValveSettings(user);
    const response = await axios.get(apiUrl);
    return response.data;
  };

  const saveDeviceSettings = async (rows) => {
    const apiUrl = setValveSettings(user);
    await axios.post(apiUrl, rows);
  };

  // Fetch device settings data
  const { data, isLoading, error } = useQuery(
    'valve-settings',
    fetchDeviceSettings,
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (data) {
      setRows(data.value);
    }
  }, [data]);

  // Mutation to save data
  const mutation = useMutation(saveDeviceSettings, {
    onSuccess: () => {
      // Invalidate and refetch data after mutation
      queryClient.invalidateQueries('deviceSettings');
    },
  });

  const handleSwitchChange = (rowKey) => {
    markRowEdited(rowKey);
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.RowKey === rowKey ? { ...row, active: !row.active } : row
      )
    );
  };
  const handleTimeChangeRepeat = (rowKey, field, newTime) => {
    markRowEdited(rowKey);
    const onlyTime = dayjs(newTime).format('HH:mm:ss');
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.RowKey === rowKey ? { ...row, [field]: onlyTime } : row
      )
    );
  };

  const handleTimeChange = (rowKey, field, newTime) => {
    markRowEdited(rowKey);
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.RowKey === rowKey ? { ...row, [field]: newTime } : row
      )
    );
  };

  const handleRadioboxChange = (evt, rowKey) => {
    markRowEdited(rowKey);
    const curOptionValue = evt.target.value;
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.RowKey === rowKey
          ? {
              ...row,
              once: curOptionValue == 'once' ? true : false,
              repeat: curOptionValue == 'repeat' ? true : false,
              manual: curOptionValue == 'manual' ? true : false,
            }
          : row
      )
    );
  };

  const updatedData = async () => {
    try {
      const updatedData = await fetchDeviceSettings();
      setRows(updatedData.value);
    } catch (err) {
      console.error('Failed to refresh valve data:', err);
    }
  };

  const handleSaveAll = async () => {
    const now = dayjs();

    const rowsToSave = rows.filter((r) => editedRows.has(r.RowKey));

    if (rowsToSave.length === 0) {
      toast.error(`No changes to save!`);
      return;
    }

    for (const row of rowsToSave) {
      if (row.once && (!row.turnOnTime || !row.turnOffTime)) {
        toast.error(
          `${getDeviceName(row.devEUI)} (${
            row.identifier
          }): Both Turn-on and Turn-off time are required!`
        );
        return;
      }
      if (
        !row.manual &&
        row.turnOnTime &&
        dayjs(row.turnOnTime).isBefore(now)
      ) {
        toast.error(
          `${getDeviceName(row.devEUI)} (${
            row.identifier
          }): Turn-on time must be now or in the future!`
        );
        return;
      }
      if (
        !row.manual &&
        row.turnOffTime &&
        dayjs(row.turnOffTime).isBefore(now)
      ) {
        toast.error(
          `${getDeviceName(row.devEUI)} (${
            row.identifier
          }): The turn-off time must be later than the turn-on time!`
        );
        return;
      }
      if (
        !row.manual &&
        row.turnOnTime &&
        row.turnOffTime &&
        dayjs(row.turnOffTime).isBefore(dayjs(row.turnOnTime))
      ) {
        toast.error(
          `${getDeviceName(row.devEUI)} (${
            row.identifier
          }): Turn-off time cannot be earlier than Turn-on time!`
        );
        return;
      }

      setSaveLoading(true);
      try {
        await mutation.mutateAsync({
          active: row.active,
          RowKey: row.RowKey,
          orgName: row.PartitionKey,
          devEUI: row.devEUI,
          once: row.once,
          repeat: row.repeat,
          manual: row.manual,
          turnOffTime: row.turnOffTime,
          turnOnTime: row.turnOnTime,
        });
      } catch (error) {
        toast.error(
          `Failed to save ${getDeviceName(row.devEUI)} (${row.identifier})`
        );
        console.error('Failed to save settings:', error);
        return;
      } finally {
        setSaveLoading(false);
      }
    }
    try {
      await axios.post(
        'https://ug65-novel-dev-2.azurewebsites.net/api/ug65-valveControlFunction'
      );
      toast.success('All settings saved successfully!');
      setEditedRows(new Set());
    } catch (err) {
      console.error('Valve control API call failed:', err);
      toast.error('Settings saved, but failed to notify valve controller');
    }
  };

  const [lastSyncMap, setLastSyncMap] = useState({});

  const SYNC_API_BASE =
    'https://ug65-novel-dev-2.azurewebsites.net/api/ug65-valveSyncStatusFunction';

  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const pollSyncStatus = async () => {
    const currentRows = rowsRef.current;
    if (!currentRows || currentRows.length === 0) return;

    const orgName = user.orgName;

    try {
      const res = await axios.get(
        `${SYNC_API_BASE}?orgName=${encodeURIComponent(orgName)}`
      );
      const syncRows = res.data?.status ?? [];
      const byKey = new Map(syncRows.map((r) => [r.rowKey, r]));

      setRows((prev) =>
        prev.map((r) => {
          const s = byKey.get(r.RowKey);
          if (!s) return r;
          if (editedRows.has(r.RowKey)) return r;
          return {
            ...r,
            active:
              typeof s.currentStatus === 'boolean' ? s.currentStatus : r.active,
          };
        })
      );

      setLastSyncMap((prev) => {
        const next = { ...prev };
        syncRows.forEach((s) => {
          next[s.rowKey] = s.synced || false;
        });
        return next;
      });
    } catch (e) {
      console.error('Valve sync poll failed:', e);
    }
  };

  useEffect(() => {
    const id = setInterval(pollSyncStatus, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      pollSyncStatus();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data</div>;

  return (
    <>
      {rows && rows.length > 0 ? (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {' '}
            <h2 style={{ paddingTop: '2px' }}>
              <strong>Device Settings</strong>
            </h2>
            <p>
              <b>Current time:</b> {dateTime}
            </p>
          </div>

          <div className="formbodymain">
            <div className="row">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TableContainer
                  component={Paper}
                  className={styles.deviceTable}
                >
                  <Table aria-label="simple table" className={styles.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell className={`${styles.stickyColumn1}`}>
                          Active
                        </TableCell>
                        <TableCell className={`${styles.stickyColumn1}`}>
                          Device
                        </TableCell>
                        <TableCell>Synced</TableCell>
                        <TableCell>Auto</TableCell>
                        <TableCell>Turn on Time</TableCell>
                        <TableCell>Turn off Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows &&
                        rows
                          .filter((row) => row?.devEUI)
                          .map((row) => {
                            let autoValue = null;
                            if (row.once) autoValue = 'once';
                            else if (row.repeat) autoValue = 'repeat';
                            else if (row.manual) autoValue = 'manual';

                            return (
                              <TableRow key={row.RowKey}>
                                <TableCell
                                  className={`${styles.settings_input}  ${styles.stickyColumn1}`}
                                >
                                  <label className="switch">
                                    <input
                                      disabled={autoLogin}
                                      type="checkbox"
                                      checked={row.active}
                                      onChange={() =>
                                        handleSwitchChange(row.RowKey)
                                      }
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </TableCell>

                                <TableCell
                                  className={`${styles.stickyColumn1}`}
                                >
                                  <div
                                    style={{ fontWeight: 'bold' }}
                                    dangerouslySetInnerHTML={{
                                      __html: getDeviceName(row.devEUI),
                                    }}
                                  />
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: row.identifier,
                                    }}
                                  />
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: row.devEUI,
                                    }}
                                  />
                                </TableCell>
                                <TableCell className={styles.stickyColumn1}>
                                  <div>
                                    {lastSyncMap[row.RowKey] ? (
                                      lastSyncMap[row.RowKey] ? (
                                        <CheckBoxIcon
                                          style={{
                                            fontSize: '24px',
                                            color: '#5EA877',
                                          }}
                                        />
                                      ) : (
                                        <CachedIcon
                                          style={{
                                            fontSize: '24px',
                                            color: 'grey',
                                          }}
                                        />
                                      )
                                    ) : (
                                      'Loading...'
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className={styles.settings_input}>
                                  <RadioGroup
                                    name="controlled-radio-buttons-group"
                                    value={autoValue}
                                    onChange={(evt) =>
                                      handleRadioboxChange(evt, row.RowKey)
                                    }
                                    className={styles.switchAutoChk}
                                  >
                                    <FormControlLabel
                                      value="once"
                                      control={
                                        <Radio
                                          disabled={autoLogin}
                                          sx={{
                                            '& .MuiSvgIcon-root': {
                                              fontSize: 20,
                                            },
                                          }}
                                        />
                                      }
                                      label="Once"
                                      className={styles.switchAutoChkLabel}
                                    />
                                    <FormControlLabel
                                      value="repeat"
                                      control={
                                        <Radio
                                          disabled={autoLogin}
                                          sx={{
                                            '& .MuiSvgIcon-root': {
                                              fontSize: 20,
                                            },
                                          }}
                                        />
                                      }
                                      label="Repeat"
                                      className={styles.switchAutoChkLabel}
                                    />
                                    <FormControlLabel
                                      value="manual"
                                      control={
                                        <Radio
                                          disabled={autoLogin}
                                          sx={{
                                            '& .MuiSvgIcon-root': {
                                              fontSize: 20,
                                            },
                                          }}
                                        />
                                      }
                                      label="Manual"
                                      className={styles.switchAutoChkLabel}
                                    />
                                  </RadioGroup>
                                </TableCell>
                                {/* <TableCell className={styles.settings_input}>
                                {autoValue === "repeat" ? (
                                  <DesktopTimePicker
                                    disabled={autoLogin}
                                    value={
                                      row.turnOnTime
                                        ? dayjs()
                                            .set(
                                              "hour",
                                              Number(
                                                row.turnOnTime.split(":")[0]
                                              )
                                            )
                                            .set(
                                              "minute",
                                              Number(
                                                row.turnOnTime.split(":")[1]
                                              )
                                            )
                                            .set(
                                              "second",
                                              Number(
                                                row.turnOnTime.split(":")[2]
                                              )
                                            )
                                        : null
                                    }
                                    onChange={(newTime) =>
                                      handleTimeChangeRepeat(
                                        row.RowKey,
                                        "turnOnTime",
                                        newTime ? newTime.toString() : ""
                                      )
                                    }
                                    minutesStep={1}
                                    className={styles.timPicker}
                                  />
                                ) : (
                                  <DateTimePicker
                                    key={row.RowKey}
                                    disabled={
                                      autoLogin || autoValue === "manual"
                                    }
                                    value={
                                      row.turnOnTime
                                        ? dayjs(row.turnOnTime)
                                        : null
                                    }
                                    onChange={(newTime) => {
                                      if (
                                        newTime &&
                                        newTime.isBefore(dayjs())
                                      ) {
                                        toast.error(
                                          "You have selected a past date/time!"
                                        );
                                      }
                                      handleTimeChange(
                                        row.RowKey,
                                        "turnOnTime",
                                        newTime
                                          ? newTime.format(
                                              "YYYY-MM-DDTHH:mm:ss"
                                            )
                                          : ""
                                      );
                                    }}
                                    minDateTime={null}
                                    format="YYYY-MM-DD HH:mm"
                                    className={styles.timPicker}
                                  />
                                )}
                              </TableCell>
                              <TableCell className={styles.settings_input}>
                                {autoValue === "repeat" ? (
                                  <DesktopTimePicker
                                    disabled={autoLogin}
                                    value={
                                      row.turnOffTime
                                        ? dayjs()
                                            .set(
                                              "hour",
                                              Number(
                                                row.turnOffTime.split(":")[0]
                                              )
                                            )
                                            .set(
                                              "minute",
                                              Number(
                                                row.turnOffTime.split(":")[1]
                                              )
                                            )
                                            .set(
                                              "second",
                                              Number(
                                                row.turnOffTime.split(":")[2]
                                              )
                                            )
                                        : null
                                    }
                                    onChange={(newTime) =>
                                      handleTimeChangeRepeat(
                                        row.RowKey,
                                        "turnOffTime",
                                        newTime ? newTime.toString() : ""
                                      )
                                    }
                                    className={styles.timPicker}
                                  />
                                ) : (
                                  <DateTimePicker
                                    disabled={autoLogin}
                                    value={
                                      row.turnOffTime
                                        ? dayjs(row.turnOffTime)
                                        : null
                                    }
                                    onChange={(newTime) => {
                                      if (
                                        newTime &&
                                        row.turnOnTime &&
                                        newTime.isBefore(dayjs(row.turnOnTime))
                                      ) {
                                        toast.error(
                                          "Turn-off time cannot be earlier than Turn-on time!"
                                        );
                                      }
                                      handleTimeChange(
                                        row.RowKey,
                                        "turnOffTime",
                                        newTime
                                          ? newTime.format("YYYY-MM-DDTHH:mm")
                                          : ""
                                      );
                                    }}
                                    showToolbar
                                    minDateTime={
                                      row.turnOnTime
                                        ? dayjs(row.turnOnTime).add(5, "minute")
                                        : dayjs()
                                    }
                                    className={styles.timPicker}
                                    format="YYYY-MM-DD HH:mm"
                                  />
                                )}
                              </TableCell> */}
                                <TableCell className={styles.settings_input}>
                                  {autoValue === 'repeat' ? (
                                    <DesktopTimePicker
                                      disabled={
                                        autoLogin || autoValue == 'manual'
                                      }
                                      value={
                                        row.turnOnTime
                                          ? dayjs()
                                              .set(
                                                'hour',
                                                Number(
                                                  row.turnOnTime.split(':')[0]
                                                )
                                              )
                                              .set(
                                                'minute',
                                                Number(
                                                  row.turnOnTime.split(':')[1]
                                                )
                                              )
                                              .set(
                                                'second',
                                                Number(
                                                  row.turnOnTime.split(':')[2]
                                                )
                                              )
                                          : null
                                      }
                                      onChange={(newTime) =>
                                        handleTimeChangeRepeat(
                                          row.RowKey,
                                          'turnOnTime',
                                          newTime ? newTime.toString() : ''
                                        )
                                      }
                                      minutesStep={1}
                                      className={styles.timPicker}
                                    />
                                  ) : (
                                    <DateTimePicker
                                      key={row.RowKey}
                                      disabled={
                                        autoLogin || autoValue == 'manual'
                                      }
                                      value={
                                        row.turnOnTime
                                          ? dayjs.utc(row.turnOnTime)
                                          : null
                                      }
                                      onChange={(newTime) =>
                                        handleTimeChange(
                                          row.RowKey,
                                          'turnOnTime',
                                          newTime
                                            ? newTime.format(
                                                'YYYY-MM-DDTHH:mm:ss'
                                              )
                                            : ''
                                        )
                                      }
                                      minDateTime={null}
                                      format="YYYY-MM-DD HH:mm"
                                      className={styles.timPicker}
                                    />
                                  )}
                                </TableCell>
                                <TableCell className={styles.settings_input}>
                                  {autoValue === 'repeat' ? (
                                    <DesktopTimePicker
                                      disabled={
                                        autoLogin || autoValue == 'manual'
                                      }
                                      value={
                                        row.turnOffTime
                                          ? dayjs()
                                              .set(
                                                'hour',
                                                Number(
                                                  row.turnOffTime.split(':')[0]
                                                )
                                              )
                                              .set(
                                                'minute',
                                                Number(
                                                  row.turnOffTime.split(':')[1]
                                                )
                                              )
                                              .set(
                                                'second',
                                                Number(
                                                  row.turnOffTime.split(':')[2]
                                                )
                                              )
                                          : null
                                      }
                                      onChange={(newTime) =>
                                        handleTimeChangeRepeat(
                                          row.RowKey,
                                          'turnOffTime',
                                          newTime ? newTime.toString() : ''
                                        )
                                      }
                                      className={styles.timPicker}
                                    />
                                  ) : (
                                    <DateTimePicker
                                      disabled={
                                        autoLogin || autoValue == 'manual'
                                      }
                                      value={
                                        row.turnOffTime
                                          ? dayjs
                                              .utc(row.turnOffTime)
                                              .second(0)
                                              .millisecond(0)
                                          : null
                                      }
                                      onChange={(newTime) =>
                                        handleTimeChange(
                                          row.RowKey,
                                          'turnOffTime',
                                          newTime
                                            ? newTime.format(
                                                'YYYY-MM-DDTHH:mm:ss'
                                              )
                                            : ''
                                        )
                                      }
                                      showToolbar
                                      minDateTime={
                                        row.turnOnTime
                                          ? dayjs(row.turnOnTime)
                                              .add(5, 'minute')
                                              .second(0)
                                              .millisecond(0)
                                          : dayjs().second(0).millisecond(0)
                                      }
                                      className={styles.timPicker}
                                      format="YYYY-MM-DD HH:mm"
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </LocalizationProvider>
            </div>
            <Button
              onClick={() => handleSaveAll()}
              variant="contained"
              color="primary"
              style={{
                color: '#ffffff',
                verticalAlign: 'middle',
                marginTop: '5px',
                width: '140px',
              }}
              className={`btn btn-success btn-block ${styles.save_btn}`}
            >
              {saveLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          <ValvePressure
            rows={rows}
            devices={devices}
            updatedData={updatedData}
          />
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export default SwitchComponent;
