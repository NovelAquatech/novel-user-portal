import { useState, useEffect } from "react";
import { Modal, Box, Typography, FormControl, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import styles from "./SwitchComponent.module.css";
import { useAuth } from "../hooks/useAuth";
import CloseIcon from "@mui/icons-material/Close";
import { toast, Toaster } from "react-hot-toast";

export const AddDeviceModal = ({ isOpen, devEUI, onCloseCreateModal }) => {
  const { user } = useAuth();
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const handleSave = async () => {
    try {
      setLoaderVisible(true);
      toast.success("Group saved successfully");
      handleClose();
    } catch (err) {
      toast.error("Error saving group. Please try again.");
    } finally {
      setLoaderVisible(false);
    }
  };
  const handleClose = (event) => {
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
          <Typography variant="h6" gutterBottom align="right">
            <Button onClick={handleClose}>
              <CloseIcon style={{ fontSize: "20px" }} />
            </Button>
          </Typography>
          <Typography variant="h6" gutterBottom align="center">
            <h3>
              <strong> Add Device </strong>
            </h3>
          </Typography>
          <FormControl fullWidth>
            <InputLabel htmlFor="component-outlined">DevEUI</InputLabel>
            <OutlinedInput
              id="component-outlined"
              defaultValue="Please enter the devEUI"
              label="devEUI"
            />
          </FormControl>
          {/* <Typography fontSize="14px" color="text.secondary" gutterBottom>
            DevEUI: <strong>{devEUI}</strong>
          </Typography> */}
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
