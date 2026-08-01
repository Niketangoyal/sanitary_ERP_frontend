import { useCallback, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
}

/**
 * Promise-based confirmation dialog: `await confirm({ message })` resolves
 * true/false, so callers can `if (!(await confirm(...))) return;` inline
 * instead of wiring per-page dialog open state.
 */
export const useConfirm = () => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | undefined>(undefined);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleClose = (result: boolean) => {
    setOptions(null);
    resolver.current?.(result);
  };

  const ConfirmDialog = (
    <Dialog open={!!options} onClose={() => handleClose(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{options?.title ?? "Please confirm"}</DialogTitle>
      <DialogContent>
        <DialogContentText>{options?.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)}>Cancel</Button>
        <Button
          onClick={() => handleClose(true)}
          color={options?.destructive ? "error" : "primary"}
          variant="contained"
          autoFocus
        >
          {options?.confirmLabel ?? "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { confirm, ConfirmDialog };
};
