import { Chip } from "@mui/material";
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS, SALE_TYPE_LABELS } from "@/utils/constants";
import type { PaymentStatus, SaleType } from "@/types";

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

export const PaymentStatusChip = ({ status }: { status: PaymentStatus }) => (
  <Chip label={PAYMENT_STATUS_LABELS[status]} color={PAYMENT_STATUS_COLORS[status]} size="small" />
);

export const SaleTypeChip = ({ saleType }: { saleType: SaleType }) => (
  <Chip label={SALE_TYPE_LABELS[saleType]} size="small" variant="outlined" />
);
