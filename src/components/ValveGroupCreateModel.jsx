import { useState } from "react";
import {
  Typography,
  MenuItem,
  Select,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { toast, Toaster } from "react-hot-toast";
import { updateValveSecondaryStatus } from "../helper/web-service";
import { useAuth } from "../hooks/useAuth";
import styles from "./SwitchComponent.module.css";
import { BaseModal } from "./Popup";

export const ValveGroupCreateModel = ({
  isOpen,
  rows,
  devices,
  onCloseCreateModel,
}) => {
  const { user } = useAuth();
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const [selectedPrimary, setSelectedPrimary] = useState("");
  const [selectedLowPressure, setSelectedLowPressure] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  const getDeviceName = (uid) => devices[uid] || "";

  // Primary valves = rows that are NOT secondary
  const primaryOptions = rows.filter((r) => r?.isSecondary === undefined);

  // Low pressure valves = rows that are not secondary and not chosen as high pressure
  const lowPressureOptions = rows.filter(
    (r) => r?.isSecondary === undefined && r.RowKey !== selectedPrimary
  );

  const handleSave = async () => {
    if (!selectedPrimary) {
      setErrMsg("Please select a High Pressure Valve.");
      return;
    }

    if (selectedLowPressure.length === 0) {
      setErrMsg("Please select at least one Low Pressure Valve.");
      return;
    }

    try {
      setLoaderVisible(true);

      // First promote selectedPrimary to primary
      const primaryRow = rows.find((r) => r.RowKey === selectedPrimary);
      await updateValveSecondaryStatus(user, {
        RowKey: primaryRow.RowKey,
        PartitionKey: primaryRow.PartitionKey,
        makeSecondary: false,
        orgName: primaryRow.orgName,
      });

      // Then assign each selectedLowPressure as secondary
      for (const lowRowKey of selectedLowPressure) {
        const lowRow = rows.find((r) => r.RowKey === lowRowKey);
        await updateValveSecondaryStatus(user, {
          RowKey: lowRow.RowKey,
          PartitionKey: lowRow.PartitionKey,
          makeSecondary: true,
          orgName: lowRow.orgName,
          primaryValve: selectedPrimary,
        });
      }

      toast.success("Group saved successfully");
      handleClose();
    } catch (err) {
      setErrMsg("Error saving group. Please try again.");
    } finally {
      setLoaderVisible(false);
    }
  };

  const handleClose = (event) => {
    setSelectedPrimary("");
    setSelectedLowPressure([]);
    onCloseCreateModel(event);
    setErrMsg("");
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <BaseModal
        isOpen={isOpen}
        closeModal={handleClose}
        title="Create Group"
        footer={
          <LoadingButton
            variant="contained"
            color="primary"
            className={`btn btn-success ${styles.save_btn}`}
            onClick={handleSave}
            loading={isLoaderVisible}
          >
            Save
          </LoadingButton>
        }
      >
        <Typography variant="h6" sx={{ mt: 3 }}>
          <h5>
            <strong> High Pressure Valve</strong>
          </h5>
        </Typography>
        <FormControl fullWidth>
          <Select
            labelId="primary-valve-label"
            value={selectedPrimary}
            onChange={(e) => {
              setSelectedPrimary(e.target.value);
              setSelectedLowPressure([]); // reset low valves when primary changes
            }}
          >
            {primaryOptions.length === 0 ? (
              <MenuItem disabled sx={{ fontSize: "13px" }}>
                No High Pressure Valve available
              </MenuItem>
            ) : (
              primaryOptions.map((pv) => (
                <MenuItem
                  key={pv.RowKey}
                  value={pv.RowKey}
                  sx={{ fontSize: "13px" }}
                >
                  {getDeviceName(pv.devEUI)} ({pv.identifier})
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <Typography variant="h6" sx={{ mt: 3 }}>
          <h5>
            <strong> Low Pressure Valve</strong>
          </h5>
        </Typography>
        <FormControl fullWidth>
          <Select
            labelId="low-valves-label"
            multiple
            value={selectedLowPressure}
            onChange={(e) => setSelectedLowPressure(e.target.value)}
            input={<OutlinedInput label="Low Pressure Valves" />}
            renderValue={(selected) =>
              selected
                .map(
                  (rk) =>
                    `${getDeviceName(
                      rows.find((r) => r.RowKey === rk)?.devEUI
                    )} (${rows.find((r) => r.RowKey === rk)?.identifier})`
                )
                .join(", ")
            }
          >
            {lowPressureOptions.length === 0 ? (
              <MenuItem disabled sx={{ fontSize: "13px" }}>
                No Low Pressure Valves available
              </MenuItem>
            ) : (
              lowPressureOptions.map((lv) => (
                <MenuItem key={lv.RowKey} value={lv.RowKey}>
                  <Checkbox
                    checked={selectedLowPressure.indexOf(lv.RowKey) > -1}
                  />
                  <ListItemText
                    primaryTypographyProps={{ fontSize: "13px" }}
                    primary={`${getDeviceName(lv.devEUI)} (${lv.identifier})`}
                  />
                </MenuItem>
              ))
            )}
          </Select>
          {errMsg && (
            <Typography color="error" variant="body2" sx={{ mt: 1, fontSize: "12px" }}>
              {errMsg}
            </Typography>
          )}
        </FormControl>
      </BaseModal>
    </>
  );
};
