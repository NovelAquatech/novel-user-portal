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
      setErrorMessage("Invalid Device EUI"|| err.message);
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
      <Modal open={isOpen} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box
            gutterBottom
            align="left"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 6,
            }}
          >
            <Typography variant="h5" component="h3">
              <strong>Add Device</strong>
            </Typography>
            <Button onClick={handleClose}>
              <CloseIcon sx={{ fontSize: "20px" }} />
            </Button>
          </Box>
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
                    {/* Error Message (inline) */}
          {errorMessage && (
            <Typography
              variant="body2"
              sx={{ color: "error.main", mt: 1, textAlign: "left" }}
            >
              {errorMessage}
            </Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <LoadingButton
              variant="contained"
              color="primary"
              style={{
                color: "#ffffff",
                verticalAlign: "middle",
                width: "150px",
                marginTop: "40px",
              }}
              className={`btn btn-success btn-block ${styles.save_btn}`}
              sx={{ py: 1 }}
              onClick={handleSave}
              loading={isLoaderVisible}
            >
              Save
            </LoadingButton>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
