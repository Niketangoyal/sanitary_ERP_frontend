import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { PageLoader } from "@/components/PageLoader";
import { useConfirm } from "@/hooks/useConfirm";
import { salaryService } from "@/services/salary.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency } from "@/utils/format";
import {
  MONTH_LABELS,
  PAYMENT_MODE_LABELS,
  SALARY_PAYMENT_STATUS_LABELS,
  SALARY_PAYMENT_STATUS_COLORS,
} from "@/utils/constants";
import type { SalaryPayment } from "@/types";
import { EditSalaryRecordDialog } from "./EditSalaryRecordDialog";
import type { EditSalaryRecordFormValues } from "./EditSalaryRecordDialog";
import { EditSalaryPaymentDialog } from "./EditSalaryPaymentDialog";
import type { EditSalaryPaymentFormValues } from "./EditSalaryPaymentDialog";

interface SalaryDetailDialogProps {
  open: boolean;
  onClose: () => void;
  salaryRecordId: string | null;
}

const SummaryRow = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
    <Typography color={strong ? "text.primary" : "text.secondary"} fontWeight={strong ? 600 : 400}>
      {label}
    </Typography>
    <Typography fontWeight={strong ? 600 : 400}>{value}</Typography>
  </Stack>
);

export const SalaryDetailDialog = ({ open, onClose, salaryRecordId }: SalaryDetailDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const [editRecordOpen, setEditRecordOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SalaryPayment | null>(null);

  const { data: record, isLoading } = useQuery({
    queryKey: ["salary-records", salaryRecordId],
    queryFn: () => salaryService.getById(salaryRecordId!),
    enabled: open && !!salaryRecordId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["salary-records"] });
    queryClient.invalidateQueries({ queryKey: ["advances"] });
  };

  const updateRecordMutation = useMutation({
    mutationFn: (values: EditSalaryRecordFormValues) => salaryService.update(salaryRecordId!, values),
    onSuccess: () => {
      enqueueSnackbar("Salary record updated", { variant: "success" });
      invalidate();
      setEditRecordOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const deleteRecordMutation = useMutation({
    mutationFn: () => salaryService.remove(salaryRecordId!),
    onSuccess: () => {
      enqueueSnackbar("Salary record deleted", { variant: "success" });
      invalidate();
      onClose();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const updatePaymentMutation = useMutation({
    mutationFn: (values: EditSalaryPaymentFormValues) =>
      salaryService.updatePayment(salaryRecordId!, editingPayment!.id, values),
    onSuccess: () => {
      enqueueSnackbar("Installment updated", { variant: "success" });
      invalidate();
      setEditingPayment(null);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => salaryService.deletePayment(salaryRecordId!, paymentId),
    onSuccess: () => {
      enqueueSnackbar("Installment deleted", { variant: "success" });
      invalidate();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDeleteRecord = async () => {
    const ok = await confirm({
      title: "Delete Salary Record",
      message: "Are you sure you want to delete this salary record? This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteRecordMutation.mutate();
  };

  const handleDeletePayment = async (payment: SalaryPayment) => {
    const ok = await confirm({
      title: "Delete Installment",
      message: `Delete this installment of ${formatCurrency(payment.amount)}? This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deletePaymentMutation.mutate(payment.id);
  };

  const payments = record?.payments ?? [];
  const canEditRecord = record && Number(record.amountPaid) === 0 && !record.deletedAt;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Salary Slip Detail</DialogTitle>
      <DialogContent dividers>
        {isLoading && <PageLoader />}
        {record && (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <div>
                <Typography variant="subtitle1">
                  {MONTH_LABELS[record.month - 1]} {record.year} — {record.salaryNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {record.employee?.fullName} ({record.employee?.employeeCode})
                </Typography>
              </div>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  label={SALARY_PAYMENT_STATUS_LABELS[record.paymentStatus]}
                  color={SALARY_PAYMENT_STATUS_COLORS[record.paymentStatus]}
                />
                {canEditRecord && (
                  <>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => setEditRecordOpen(true)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={handleDeleteRecord}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Stack>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={12}>
                <SummaryRow label="Gross Salary" value={formatCurrency(record.grossSalary)} />
                <SummaryRow
                  label={`Leave Deduction (${record.unpaidLeaveDays} unpaid, ${record.paidLeaveDays} paid)`}
                  value={`- ${formatCurrency(record.leaveDeduction)}`}
                />
                <SummaryRow label="Advance Deduction" value={`- ${formatCurrency(record.advanceDeduction)}`} />
                <SummaryRow label="Net Pay" value={formatCurrency(record.netPay)} strong />
                <SummaryRow label="Amount Paid" value={formatCurrency(record.amountPaid)} />
                <SummaryRow label="Remaining Salary" value={formatCurrency(record.balanceDue)} strong />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Salary Payment History
            </Typography>
            {payments.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No payments recorded yet.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Recorded By</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{dayjs(p.paymentDate).format("DD MMM YYYY")}</TableCell>
                      <TableCell align="right">{formatCurrency(p.amount)}</TableCell>
                      <TableCell>{PAYMENT_MODE_LABELS[p.paymentMethod]}</TableCell>
                      <TableCell>{p.recordedBy?.name ?? "-"}</TableCell>
                      <TableCell>{p.remarks ?? "-"}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => setEditingPayment(p)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeletePayment(p)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <EditSalaryRecordDialog
        open={editRecordOpen}
        onClose={() => setEditRecordOpen(false)}
        onSubmit={(values) => updateRecordMutation.mutate(values)}
        isSubmitting={updateRecordMutation.isPending}
        record={record ?? null}
      />
      <EditSalaryPaymentDialog
        open={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        onSubmit={(values) => updatePaymentMutation.mutate(values)}
        isSubmitting={updatePaymentMutation.isPending}
        payment={editingPayment}
      />
      {ConfirmDialog}
    </Dialog>
  );
};

export default SalaryDetailDialog;
