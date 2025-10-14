import { useState, useEffect } from "react";
import { Modal, Box, Typography, FormControl, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import styles from "./SwitchComponent.module.css";
import { useAuth } from "../hooks/useAuth";
import CloseIcon from "@mui/icons-material/Close";
import { toast, Toaster } from "react-hot-toast";
import { addDevice } from "../helper/web-service";
import { BaseModal } from "./Popup";

export const AddDeviceModal = ({
  isOpen,
  onCloseCreateModal,
  onDeviceAdded,
}) => {
  const { user } = useAuth();
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const [devEUI, setDevEUI] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleSave = async () => {
    if (!devEUI) {
      setErrorMessage("Please enter a valid DevEUI.");
      return;
    }
    try {
      setLoaderVisible(true);
      const response = await addDevice(user, devEUI);
      toast.success("Device added successfully");
      handleClose();
      onDeviceAdded();
    } catch (err) {
      setErrorMessage("Invalid Device EUI" || err.message);
    } finally {
      setLoaderVisible(false);
    }
  };
  const handleClose = (event) => {
    setDevEUI("");
    onCloseCreateModal(event);
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
        <FormControl fullWidth>
          <InputLabel htmlFor="component-outlined">DevEUI</InputLabel>
          <OutlinedInput
            id="devEUI-input"
            value={devEUI}
            onChange={(e) => setDevEUI(e.target.value.trim())}
            label="DevEUI"
            placeholder="Enter DevEUI"
          />
        </FormControl>
        {errorMessage && (
          <Typography
            variant="body2"
            sx={{ color: "error.main", mt: 1, textAlign: "left" }}
          >
            {errorMessage}
          </Typography>
        )}
      </BaseModal>
    </>
  );
};
