import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { AxiosError } from "axios";
import React from "react";
import { useAuthStore } from "../hooks/useAuthStore";
import { useErrorStore } from "../hooks/useErrorStore";
import { logger } from "../logging";

export function AsyncErrorDialog() {
  const { error, clearError } = useErrorStore((state) => ({
    error: state.error,
    clearError: state.clearError,
  }));

  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  let handleClose = () => {
    clearError();
  };

  let errorMsg = "We are sorry but an unexpected error happened";

  if (error) {
    logger.error("Error detected", error);

    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        errorMsg = "Seems your credential is no longer valid. Please try to sign-in again.";
        handleClose = () => {
          clearCredentials();
          clearError();
        };
      }
    }
  }

  return (
    <Dialog
      open={error !== undefined}
      onClose={handleClose}
      disableEscapeKeyDown
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      data-testid="async-error-dialog"
    >
      <DialogTitle id="alert-dialog-title">Ups an error occurred</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{errorMsg}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
