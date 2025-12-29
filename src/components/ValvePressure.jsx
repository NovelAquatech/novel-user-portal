import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Button,
  Typography,
  TableHead,
} from '@mui/material';
import styles from './SwitchComponent.module.css';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoIcon from '@mui/icons-material/Info';
import { LoadingButton } from '@mui/lab';
import { updateValveSecondaryStatus } from '../helper/web-service';
import { useAuth } from '../hooks/useAuth';
import { toast, Toaster } from 'react-hot-toast';
import { ValveGroupCreateModel } from './ValveGroupCreateModel';
import { ValveSettingModel } from './ValveSettingModel';

const ValvePressure = ({ rows, devices, updatedData }) => {
  const { user } = useAuth();
  const [deleteLoading, setDeleteLoading] = useState({});
  const [isCreateModelOpen, setCreateModelOpen] = useState(false);
  const [isSettingModelOpen, setSettingModelOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editGroup, setEditGroup] = useState(null);

  const ungrouped = rows.filter(
    (r) => r?.isSecondary === null || r?.isSecondary === undefined
  );

  const primaries = rows.filter((r) => r?.isSecondary === false);

  const buildGroups = () =>
    primaries.map((primary, index) => {
      const secondaries = rows.filter(
        (r) => r?.isSecondary === true && r?.primaryValve === primary.RowKey
      );
      return { id: index + 1, primary, secondaries };
    });

  const groups = buildGroups();
 
  const getDeviceName = (uid) => {
    return devices[uid] || '';
  };

  const handleEdit = (valve, group) => {
    setSettingModelOpen(true);
    setEditRow(valve);
    if(group) setEditGroup(group);
  };

  const onCloseCreateModel = async (event) => {
    const closedByUser = !event;
    setCreateModelOpen(false);
    if (closedByUser) updatedData();
  };

  const onCloseSettingModel = async (event) => {
    const closedByUser = !event;
    setSettingModelOpen(false);
    if (closedByUser) updatedData();
  };

  const handleDeleteGroup = async (group) => {
    setDeleteLoading((prev) => ({ ...prev, [group.id]: true }));

    const valves = [
      {
        RowKey: group.primary.RowKey,
        PartitionKey: group.primary.PartitionKey,
        makeSecondary: null,
        orgName: group.primary.orgName,
      },
      ...group.secondaries.map((valve) => ({
        RowKey: valve.RowKey,
        PartitionKey: valve.PartitionKey,
        makeSecondary: null,
        orgName: valve.orgName,
      })),
    ];

    try {
      await Promise.all(
        valves.map((valve) => updateValveSecondaryStatus(user, valve))
      );

      toast.success('Group deleted successfully!');
      updatedData();
    } catch (err) {
      toast.error('Error deleting group. Please try again!');
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [group.id]: false }));
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div style={{ marginTop: '40px' }}>
        <h2>
          <strong>Valve Pressure</strong>
        </h2>

        <h4>
          <strong>Ungrouped</strong>
        </h4>
        <TableContainer component={Paper} className={styles.deviceTable}>
          <Table aria-label="simple table" className={styles.table}>
            <TableHead>
              <TableRow>
                <TableCell className={`${styles.stickyColumn1}`}>
                  Device
                </TableCell>
                <TableCell>Pressure</TableCell>
                <TableCell>Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ungrouped.length > 0 ? (
                ungrouped.map((valve) => (
                  <TableRow key={valve.RowKey} style={{ height: '120px' }}>
                    <TableCell className={`${styles.stickyColumn1}`}>
                      <div
                        style={{ fontWeight: 'bold' }}
                        dangerouslySetInnerHTML={{
                          __html: getDeviceName(valve.devEUI),
                        }}
                      />
                      <div
                        dangerouslySetInnerHTML={{
                          __html: valve.label,
                        }}
                      />
                      <div
                        dangerouslySetInnerHTML={{
                          __html: valve.devEUI,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          color: '#98690C',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          padding: '8px',
                          borderRadius: '15px',
                          backgroundColor: '#FEF9EE',
                        }}
                      >
                        Not Selected
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleEdit(valve)}>
                        <InfoIcon style={{ fontSize: '20px' }} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow style={{ height: '120px' }}>
                  <TableCell
                    colSpan={3}
                    align="center"
                    className={`${styles.stickyColumn1}`}
                  >
                    <div style={{ fontWeight: 'bold' }}>
                      {' '}
                      No ungrouped valves
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Groups */}
        {groups.map((g) => (
          <div key={g.id} style={{ marginBottom: '5px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                <h4>
                  <strong> Group {g.id}</strong>{' '}
                  <LoadingButton
                    onClick={() => handleDeleteGroup(g)}
                    loading={deleteLoading[g.id]}
                  >
                    {!deleteLoading[g.id] && (
                      <DeleteOutlineIcon
                        style={{
                          fontSize: '25px',
                          color: '#301919ff',
                          marginLeft: '-35px',
                          marginTop: '-5px',
                        }}
                      />
                    )}
                  </LoadingButton>
                </h4>
              </Typography>

              {/* Add delete group action later */}
            </div>
            <TableContainer component={Paper} className={styles.deviceTable}>
              <Table aria-label="simple table" className={styles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell className={`${styles.stickyColumn1}`}>
                      Device
                    </TableCell>
                    <TableCell>Pressure</TableCell>
                    <TableCell>Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Primary */}
                  <TableRow style={{ height: '120px' }}>
                    <TableCell className={`${styles.stickyColumn1}`}>
                      <div
                        style={{ fontWeight: 'bold' }}
                        dangerouslySetInnerHTML={{
                          __html: getDeviceName(g.primary.devEUI),
                        }}
                      />
                      <div
                        dangerouslySetInnerHTML={{
                          __html: g.primary.label,
                        }}
                      />
                      <div
                        dangerouslySetInnerHTML={{
                          __html: g.primary.devEUI,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          color: '#E36868',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          padding: '8px',
                          borderRadius: '15px',
                          backgroundColor: '#FDF2F2',
                        }}
                      >
                        High Pressure
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleEdit(g.primary)}>
                        <BorderColorIcon style={{ fontSize: '20px' }} />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {/* Secondaries */}
                  {g.secondaries.map((s) => (
                    <TableRow key={s.RowKey} style={{ height: '120px' }}>
                      <TableCell className={`${styles.stickyColumn1}`}>
                        <div
                          style={{ fontWeight: 'bold' }}
                          dangerouslySetInnerHTML={{
                            __html: getDeviceName(s.devEUI),
                          }}
                        />
                        <div
                          dangerouslySetInnerHTML={{
                            __html: s.label,
                          }}
                        />
                        <div
                          dangerouslySetInnerHTML={{
                            __html: s.devEUI,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            color: '#5EA877',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            padding: '8px',
                            borderRadius: '15px',
                            backgroundColor: '#EEFDF3',
                          }}
                        >
                          Low Pressure
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleEdit(s, g)}>
                          <BorderColorIcon style={{ fontSize: '20px' }} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        ))}

        <Button
          onClick={() => setCreateModelOpen(true)}
          variant="contained"
          color="primary"
          style={{
            color: '#ffffff',
            verticalAlign: 'middle',
            marginTop: '5px',
            width: '150px',
          }}
          className={`btn btn-success btn-block ${styles.save_btn}`}
        >
          + Create Group
        </Button>
      </div>
      <ValveGroupCreateModel
        isOpen={isCreateModelOpen}
        rows={rows}
        devices={devices}
        onCloseCreateModel={onCloseCreateModel}
      />
      <ValveSettingModel
        isOpen={isSettingModelOpen}
        row={editRow}
        rows={rows}
        devices={devices}
        onCloseSettingModel={onCloseSettingModel}
        editGroup={editGroup}
      />
    </>
  );
};

export default ValvePressure;