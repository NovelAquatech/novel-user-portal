import { useState, useEffect } from "react";
import { FormControl, FormHelperText } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import styles from "./SwitchComponent.module.css";
import { useAuth } from "../hooks/useAuth";
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
  const handleChange = (e) => {
    const value = e.target.value.trim();
    setDevEUI(value);
    if (errorMessage) setErrorMessage("");
    if (value.length > 0 && value.length < 12) {
      setErrorMessage("DevEUI must be at least 12 characters long.");
    }
  };
  const handleSave = async () => {
    if (!devEUI) {
      setErrorMessage("Please enter a valid DevEUI.");
      return;
    }
    if (devEUI.length < 12) {
      setErrorMessage("DevEUI must be at least 12 characters long.");
      return;
    }
    try {
      setLoaderVisible(true);
      const response = await addDevice(user, devEUI);
      toast.success("Device added successfully");
      handleClose();
      onDeviceAdded();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoaderVisible(false);
    }
  };
  const handleClose = (event) => {
    setDevEUI("");
    setErrorMessage("");
    onCloseCreateModal(event);
  };
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BaseModal
        isOpen={isOpen}
        closeModal={handleClose}
        title="Add Device"
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
            onChange={handleChange}
            label="DevEUI"
            placeholder="Enter DevEUI"
          />
          {errorMessage && (
            <FormHelperText
              sx={{ color: "error.main", mt: 1, textAlign: "left", fontSize: "12px" }}
            >
              {errorMessage}
            </FormHelperText>
          )}
        </FormControl>
      </BaseModal>
    </>
  );
};
