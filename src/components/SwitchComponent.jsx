import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import styles from "./SwitchComponent.module.css";
import { Button } from "@mui/material";
import { toast, Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { getValveSettings, setValveSettings } from "../helper/web-service";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const SwitchComponent = ({ devices, autoLogin }) => {
  const [loadingRows, setLoadingRows] = useState({});
  const [rows, setRows] = useState([]);
  const [dateTime, setDateTime] = useState(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const getDeviceName = (uid) => {
    return devices[uid] || "";
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
    "valve-settings",
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
      queryClient.invalidateQueries("deviceSettings");
    },
  });

  const handleSwitchChange = (rowKey) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.RowKey === rowKey ? { ...row, active: !row.active } : row
      )
    );
  };
  const handleTimeChangeRepeat = (rowKey, field, newTime) => {
    const onlyTime = dayjs(newTime).format("HH:mm:ss");
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.RowKey === rowKey ? { ...row, [field]: onlyTime } : row
      )
    );
  };

  const handleTimeChange = (rowKey, field, newTime) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.RowKey === rowKey ? { ...row, [field]: newTime } : row
      )
    );
  };

  const handleRadioboxChange = (evt, rowKey) => {
    const curOptionValue = evt.target.value;
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.RowKey === rowKey
          ? {
              ...row,
              once: curOptionValue == "once" ? true : false,
              repeat: curOptionValue == "repeat" ? true : false,
              manual: curOptionValue == "manual" ? true : false,
            }
          : row
      )
    );
  };

   const handleSave = async (row) => {
    const now = dayjs();

    if (row.turnOnTime && dayjs(row.turnOnTime).isBefore(now)) {
      toast.error("Turn-on time must be now or in the future!");
      return;
    }

    if (row.turnOffTime && dayjs(row.turnOffTime).isBefore(now)) {
      toast.error("The turn-off time must be later than the turn-on time!");
      return;
    }

    if (
      row.turnOnTime &&
      row.turnOffTime &&
      dayjs(row.turnOffTime).isBefore(dayjs(row.turnOnTime))
    ) {
      toast.error("Turn-off time cannot be earlier than Turn-on time!");
      return;
    }

    setLoadingRows((prev) => ({ ...prev, [row.RowKey]: true }));

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
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setLoadingRows((prev) => ({ ...prev, [row.RowKey]: false }));
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data</div>;

  return (
    <>
      {rows && rows.length > 0 ? (
        <div>
          <div style={{display: "flex", justifyContent:"space-between",alignItems: "center"}}>
            {" "}
            <h2 style={{ paddingTop: "2px" }}>
              <strong>Device Settings</strong>
            </h2>
            <p><b>Current time:</b> {dateTime}</p>
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
                        <TableCell>Auto</TableCell>
                        <TableCell>Turn on Time</TableCell>
                        <TableCell>Turn off Time</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows &&
                        rows.map((row) => {
                          let autoValue = null;
                          if (row.once) autoValue = "once";
                          else if (row.repeat) autoValue = "repeat";
                          else if (row.manual) autoValue = "manual";
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

                              <TableCell className={`${styles.stickyColumn1}`}>
                                <div
                                  style={{ fontWeight: "bold" }}
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
                                          "& .MuiSvgIcon-root": {
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
                                          "& .MuiSvgIcon-root": {
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
                                          "& .MuiSvgIcon-root": {
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
                              <TableCell className={styles.settings_input}>
                              
                                {autoValue === "repeat" ? (
                                  <DesktopTimePicker
                                  disabled={autoLogin || (autoValue == "manual")}
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
                                )  : (
                                  <DateTimePicker
                                    key={row.RowKey}
                                    disabled={autoLogin || (autoValue == "manual")}
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
                                  disabled={autoLogin || (autoValue == "manual")}
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
                                  disabled={autoLogin || (autoValue == "manual")}
                                    value={
                                      row.turnOffTime
                                        ? dayjs(row.turnOffTime)
                                            .second(0)
                                            .millisecond(0)
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
                                        return;
                                      }
                                      handleTimeChange(
                                        row.RowKey,
                                        "turnOffTime",
                                        newTime
                                          ? newTime.format(
                                              "YYYY-MM-DDTHH:mm:ss"
                                            )
                                          : ""
                                      );
                                    }}
                                    showToolbar
                                    minDateTime={
                                      row.turnOnTime
                                        ? dayjs(row.turnOnTime)
                                            .add(5, "minute")
                                            .second(0)
                                            .millisecond(0)
                                        : dayjs().second(0).millisecond(0)
                                    }
                                    className={styles.timPicker}
                                    format="YYYY-MM-DD HH:mm"
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => handleSave(row)}
                                  variant="contained"
                                  color="primary"
                                  style={{
                                    color: "#ffffff",
                                    verticalAlign: "middle",
                                  }}
                                  disabled={
                                    loadingRows[row.RowKey] || autoLogin
                                  }
                                  className={`btn btn-success btn-block ${styles.save_btn}`}
                                >
                                  {loadingRows[row.RowKey]
                                    ? "Saving..."
                                    : "Save"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </LocalizationProvider>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default SwitchComponent;
