import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  Button,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { toast, Toaster } from "react-hot-toast";
import { updateValveSecondaryStatus } from "../helper/web-service";
import { useAuth } from "../hooks/useAuth";
import styles from "./SwitchComponent.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { BaseModal } from "./Popup";

export const ValveSettingModel = ({
  isOpen,
  row,
  rows,
  devices,
  onCloseSettingModel,
  editGroup,
}) => {
  const valveType =
    row?.isSecondary !== undefined
      ? row?.isSecondary
        ? "Low Pressure"
        : "High Pressure"
      : "Not Set";
  const isSecondary = row?.isSecondary !== undefined && row?.isSecondary;
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const [selectedPrimary, setSelectedPrimary] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (isSecondary && row?.primaryValve)
      // Pre-select the current primary valve
      setSelectedPrimary(row.primaryValve);
  }, [isSecondary, row]);

  const getDeviceName = (uid) => devices[uid] || "";

  const primaryValves = rows.filter(
    (r) => r?.isSecondary === false && r?.devEUI !== undefined
  );

  const handleAssignSecondary = async () => {
    if (!selectedPrimary) {
      toast.error("Please select a primary valve.");
      return;
    }
    const payload = {
      RowKey: row.RowKey,
      PartitionKey: row.PartitionKey,
      makeSecondary: true,
      orgName: row.orgName,
      primaryValve: selectedPrimary,
    };

    try {
      setLoaderVisible(true);
      await updateValveSecondaryStatus(user, payload);

      if (
        editGroup &&
        editGroup.secondaries.length === 1 &&
        row.primaryValve !== selectedPrimary
      ) {
        const payload = {
          RowKey: editGroup.primary.RowKey,
          PartitionKey: editGroup.primary.PartitionKey,
          makeSecondary: null,
          orgName: editGroup.primary.orgName,
        };

        try {
          setLoaderVisible(true);
          await updateValveSecondaryStatus(user, payload);
        } catch (err) {
          console.log("Error saving settings. Please try again.");
        }
      }

      toast.success("Settings saved successfully");
      onCloseSettingModel();
    } catch (err) {
      toast.error("Error saving settings. Please try again.");
    } finally {
      setLoaderVisible(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BaseModal
        isOpen={isOpen}
        closeModal={onCloseSettingModel}
        title="Settings"
        footer={
          <div>
            {isSecondary ? (
              <LoadingButton
                variant="contained"
                color="primary"
                className={`btn btn-success  ${styles.save_btn}`}
                onClick={handleAssignSecondary}
                loading={isLoaderVisible}
              >
                Save
              </LoadingButton>
            ) : (
              <LoadingButton
                variant="contained"
                color="primary"
                className={`btn btn-success ${styles.save_btn}`}
                onClick={onCloseSettingModel}
              >
                Close
              </LoadingButton>
            )}
          </div>
        }
      >
        <>
          <Typography
            fontSize="16px"
            fontWeight={600}
            gutterBottom
            sx={{ mt: 3 }}
          >
            Name: {getDeviceName(row?.devEUI)} - {row?.identifier}
          </Typography>

          <Typography fontSize="14px" color="text.secondary" gutterBottom>
            DevEUI: <strong>{row?.devEUI}</strong>
          </Typography>

          <Typography fontSize="14px" color="text.primary">
            Pressure: {valveType}
          </Typography>

          {valveType === "High Pressure" && (
            <Box sx={{ mt: 3 }}>
              <Typography fontSize="14px" color="text.primary">
                There are no configurations for high pressure valves. To change
                the association, please delete the grouping then create a new
                group.
              </Typography>
            </Box>
          )}

          {valveType === "Not Set" && (
            <Box sx={{ mt: 3 }}>
              <Typography fontSize="14px" color="text.primary">
                There are no configurations for ungrouped valves. To change the
                association, please create a new group.
              </Typography>
            </Box>
          )}

      
            {isSecondary && (
              <>
                <Box sx={{ mt: 3 }}>
                  <Typography
                    fontSize="17px"
                    fontWeight={600}
                    gutterBottom
                    sx={{ mt: 1 }}
                  >
                    Related High Pressure Valve
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <Select
                    labelId="primary-valve-label"
                    value={selectedPrimary}
                    onChange={(e) => setSelectedPrimary(e.target.value)}
                  >
                    {primaryValves.map((pv) => (
                      <MenuItem
                        key={pv.RowKey}
                        value={pv.RowKey}
                        sx={{ fontSize: "13px" }}
                      >
                        {getDeviceName(pv.devEUI)} - {pv.identifier}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          
        </>
      </BaseModal>
    </>
  );
};
