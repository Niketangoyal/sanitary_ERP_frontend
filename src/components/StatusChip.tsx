import { Chip } from "@mui/material";

export const StatusChip = ({ active }: { active: boolean }) => (
  <Chip
    label={active ? "Active" : "Inactive"}
    color={active ? "success" : "default"}
    size="small"
    variant={active ? "filled" : "outlined"}
  />
);

export const BalanceChip = ({ value }: { value: number }) => (
  <Chip
    label={value < 0 ? "Advance" : value === 0 ? "Settled" : "Outstanding"}
    color={value < 0 ? "info" : value === 0 ? "success" : "warning"}
    size="small"
  />
);
