import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PAYMENT_MODE_LABELS } from "@/utils/constants";
import type { SalaryPayment } from "@/types";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentDate: z.string().min(1),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"]),
  remarks: z.string().optional(),
});

export type EditSalaryPaymentFormValues = z.infer<typeof schema>;

interface EditSalaryPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EditSalaryPaymentFormValues) => void;
  isSubmitting?: boolean;
  payment: SalaryPayment | null;
}

export const EditSalaryPaymentDialog = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  payment,
}: EditSalaryPaymentDialogProps) => {
  const { register, control, handleSubmit, reset } = useForm<EditSalaryPaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, paymentDate: dayjs().format("YYYY-MM-DD"), paymentMethod: "CASH", remarks: "" },
  });

  useEffect(() => {
    if (open && payment) {
      reset({
        amount: Number(payment.amount),
        paymentDate: dayjs(payment.paymentDate).format("YYYY-MM-DD"),
        paymentMethod: payment.paymentMethod,
        remarks: payment.remarks ?? "",
      });
    }
  }, [open, payment, reset]);

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Installment</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
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
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditSalaryPaymentDialog;
