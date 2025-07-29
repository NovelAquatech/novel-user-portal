import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { toast, Toaster } from "react-hot-toast";
import { updateValveSecondaryStatus } from '../helper/web-service';
import { useAuth } from '../hooks/useAuth';

export const ValveModel = ({
  isOpen,
  closeModel,
  row,
  rows,
  devices,
}) => {
  const isSecondary = row?.primaryValve !== undefined;
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const { user } = useAuth();

  const getDeviceName = (uid) => devices[uid] || '';

  console.log(rows[2].devEUI)

  const primaryValves = rows.filter((r) => r.primaryValve === undefined && r.devEUI !== undefined);
  const isLastPrimary = !isSecondary && primaryValves.length === 1;

  const handleAssignSecondary = () => {
    if (isLastPrimary) {
      toast.error("At least one valve must remain primary.");
      return;
    }

    const payload = {
      RowKey: row.RowKey,
      PartitionKey: row.PartitionKey,
      makeSecondary: true,
      orgName: row.orgName,
      primaryValve: '', // no longer required
    };
    handleSave(payload);
  };

  const handlePromoteToPrimary = () => {
    const payload = {
      RowKey: row.RowKey,
      PartitionKey: row.PartitionKey,
      makeSecondary: false,
      orgName: row.orgName,
    };
    handleSave(payload);
  };

  const handleSave = async (payload) => {
    try {
      setLoaderVisible(true);
      await updateValveSecondaryStatus(user, payload);
      toast.success('Settings saved successfully');
      closeModel();
    } catch (err) {
      toast.error('Error saving settings. Please try again.');
    } finally {
      setLoaderVisible(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Modal open={isOpen} onClose={closeModel}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography fontSize="16px" fontWeight={600} gutterBottom>
            {getDeviceName(row?.devEUI)} - {row?.identifier}
          </Typography>

          <Typography fontSize="14px" color="text.secondary" gutterBottom>
            DevEUI: <strong>{row?.devEUI}</strong>
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography fontSize="14px" color="text.primary">
              {isSecondary ? (
                <>
                  This is a <strong>Low Pressure Valve</strong>
                </>
              ) : (
                <>
                  This is a <strong>High Pressure Valve</strong>
                </>
              )}
            </Typography>
          </Box>

          {isSecondary ? (
            <LoadingButton
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 4, py: 1.5, fontSize: '12px' }}
              onClick={handlePromoteToPrimary}
              loading={isLoaderVisible}
            >
              Make it High Pressure
            </LoadingButton>
          ) : (
            <>
              <LoadingButton
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 4, py: 1.5, fontSize: '12px' }}
                onClick={handleAssignSecondary}
                loading={isLoaderVisible}
                disabled={isLastPrimary}
              >
                Make it Low Pressure
              </LoadingButton>

              {isLastPrimary && (
                <Typography
                  sx={{ mt: 2 }}
                  color="error"
                  fontSize="12px"
                >
                  Warning: At least one high pressure valve must exist.
                </Typography>
              )}
            </>
          )}

          <Button
            onClick={closeModel}
            fullWidth
            sx={{
              mt: 3,
              py: 1.4,
              fontSize: '12px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ccc',
              color: '#000',
              '&:hover': {
                backgroundColor: '#eee',
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Modal>
    </>
  );
};
