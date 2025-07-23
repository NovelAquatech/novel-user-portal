import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { toast, Toaster } from "react-hot-toast";
import { updateValveSecondaryStatus} from '../helper/web-service'
import { useAuth } from '../hooks/useAuth'

export const ValveModel = ({
  isOpen,
  closeModel,
  row,
  rows,
  devices,
}) => {
  const isSecondary = !!row?.primaryValve;
  const [selectedPrimary, setSelectedPrimary] = useState('');
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const { user } = useAuth();

  const getDeviceName = (uid) => devices[uid] || '';

  const validPrimaries = rows.filter(
    (r) =>
      r.devEUI === row?.devEUI && !r.primaryValve && r.RowKey !== row?.RowKey
  );

  const handleAssignSecondary = () => {
    if (!selectedPrimary) return;
    let payload = {
      RowKey: row.RowKey,
      PartitionKey: row.PartitionKey,
      makeSecondary: true,
      orgName: row.orgName,
      primaryValve: selectedPrimary,
    };
    handleSave(payload);
  };

  const handlePromoteToPrimary = () => {
    let payload = {
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
      setLoaderVisible(false);
      closeModel();
    } catch (err) {
      toast.error('Error saving settings. Please try again.');
      setLoaderVisible(false);
    }
  };

  return (
    <><Toaster position="top-right" reverseOrder={false} />
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
                This is a <strong>Secondary Valve</strong> linked to:{' '}
                <code>{row.primaryValve}</code>
              </>
            ) : (
              <>
                This is a <strong>Primary Valve</strong>
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
            Make it Primary
          </LoadingButton>
        ) : validPrimaries.length > 0 ? (
          <>
            <FormControl fullWidth sx={{ mt: 4 }}>
              <InputLabel id="select-primary-label" sx={{ fontSize: '12px' }}>
                Attach to Primary Valve
              </InputLabel>
              <Select
                labelId="select-primary-label"
                value={selectedPrimary}
                label="Attach to Primary Valve"
                onChange={(e) => setSelectedPrimary(e.target.value)}
                sx={{ fontSize: '12px' }}
              >
                {validPrimaries.map((valve) => (
                  <MenuItem
                    key={valve.RowKey}
                    value={valve.RowKey}
                    sx={{ fontSize: '12px' }}
                  >
                    {valve.identifier} ({valve.RowKey})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LoadingButton
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.5, fontSize: '12px' }}
              onClick={handleAssignSecondary}
              disabled={!selectedPrimary}
              loading={isLoaderVisible}
            >
              Assign as Secondary
            </LoadingButton>
          </>
        ) : (
          <Typography sx={{ mt: 4 }} color="text.secondary" fontSize="12px">
            No available primary valves with matching DevEUI.
          </Typography>
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
