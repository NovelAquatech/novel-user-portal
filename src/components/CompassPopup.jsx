import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import CompassHtml from "./CompassHtml";

function CompassPopup({ value }) {
  // State to control dialog visibility
  const [open, setOpen] = useState(false);

  // Open the dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {/* Button to trigger the dialog */}
      <Button
        variant="none"
        onClick={handleClickOpen}
        style={{ fontSize: "1.4rem", textTransform: "none" }}
      >
        Compass view here
      </Button>

      {/* Dialog component */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <h3 style={{ textAlign: "center" }}>Wind Direction {value} °</h3>
        </DialogTitle>
        <DialogContent
          sx={{
            minHeight: "400px", // Set minimum height
            minWidth: "400px", // Set minimum width
          }}
        >
          <p>
            <CompassHtml rotate={value} />
          </p>
          <h3>{}</h3>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CompassPopup;
