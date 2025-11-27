import { useState, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { BaseModal } from './Popup';
import styles from './SwitchComponent.module.css';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export const EditLabelModal = ({
  isOpen,
  row,
  title = 'Edit Label',
  onClose,
}) => {
  const [label, setLabel] = useState(row?.label || row?.identifier || '');
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();

  const authToken = user.token;

  // Reset local state whenever modal opens or label changes
  useEffect(() => {
    if (isOpen) {
      setLabel(row?.label || row?.identifier || '');
    }
  }, [isOpen, row]);

  const handleSave = async () => {
    setIsSaving(true);

    const payload = {
      label,
      identifier: row?.identifier,
      devEUI: row?.devEUI,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_UPDATE_VALVE_LABEL}?authToken=${authToken}`,
        payload
      );
      toast.success('Valve label saved successfully!');
      handleClose();
    } catch (err) {
      toast.error('Could not save valve label. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

   const handleClose = (event) => {
    setLabel('');
    onClose(event);
  };

  const isSaveDisabled = !label.trim();

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
          {/* You can keep this typography to match existing modal spacing/feel */}
          <Typography
            fontSize="16px"
            fontWeight={600}
            gutterBottom
            sx={{ mt: 3 }}
          >
            Label
          </Typography>

          <Box sx={{ mt: 1, mb: 5 }}>
            <TextField
              fullWidth
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              variant="outlined"
              size="small"
              fontSize="16px"
            />
          </Box>
        </>
      </BaseModal>
    </>
  );
};
