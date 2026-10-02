import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PAYMENT_MODE_LABELS } from "@/utils/constants";
import { formatCurrency } from "@/utils/format";
import type { SalaryRecord } from "@/types";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentDate: z.string().min(1),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"]),
  remarks: z.string().optional(),
});

export type PaySalaryFormValues = z.infer<typeof schema>;

interface PaySalaryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PaySalaryFormValues) => void;
  isSubmitting?: boolean;
  record: SalaryRecord | null;
}

export const PaySalaryDialog = ({ open, onClose, onSubmit, isSubmitting, record }: PaySalaryDialogProps) => {
  const { register, control, handleSubmit, reset } = useForm<PaySalaryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      paymentDate: dayjs().format("YYYY-MM-DD"),
      paymentMethod: "CASH",
      remarks: "",
    },
  });

  useEffect(() => {
    if (open && record) {
      reset({
        amount: Number(record.balanceDue),
        paymentDate: dayjs().format("YYYY-MM-DD"),
        paymentMethod: "CASH",
        remarks: "",
      });
    }
  }, [open, record, reset]);

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Pay Salary</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          {record && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Balance Due: {formatCurrency(record.balanceDue)}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("amount")}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="paymentDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Payment Date"
                    value={dayjs(field.value)}
                    onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Payment Method" fullWidth>
                    {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Remarks" fullWidth {...register("remarks")} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Pay
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
