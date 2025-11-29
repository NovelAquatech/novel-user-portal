import { useState, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { BaseModal } from './Popup';
import styles from './SwitchComponent.module.css';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export const EditDeviceModal = ({
  isOpen,
  device,
  title = 'Edit device name',
  onClose,
}) => {
  const [devName, setDevName] = useState(device?.devName || '');
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();

  const authToken = user.token;

  // Reset local state whenever modal opens or label changes
  useEffect(() => {
    if (isOpen) {
      setDevName(device?.devName || '');
    }
  }, [isOpen, device]);

  const handleSave = async () => {
    setIsSaving(true);

    const payload = {
      devName,
      devEUI: device?.devEUI,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_UPDATE_DEVICE_NAME}?authToken=${authToken}`,
        payload
      );
      toast.success('Device name saved successfully!');
      handleClose();
    } catch (err) {
      toast.error('Could not save Device name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

   const handleClose = (event) => {
    setDevName('');
    onClose(event);
  };

  const isSaveDisabled = !devName.trim();

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BaseModal
        isOpen={isOpen}
        closeModal={handleClose}
        title={title}
        footer={
          <div>
            <LoadingButton
              variant="contained"
              color="primary"
              className={`btn btn-success ${styles.save_btn}`}
              onClick={handleSave}
              loading={isSaving}
              disabled={isSaveDisabled || isSaving}
            >
              Save
            </LoadingButton>
          </div>
        }
      >
        <>

          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              variant="outlined"
              size="large"
              fontSize="16px"
              label="Label"
            />
          </Box>
        </>
      </BaseModal>
    </>
  );
};
