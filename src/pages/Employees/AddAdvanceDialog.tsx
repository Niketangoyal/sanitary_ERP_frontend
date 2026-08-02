import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { AdvancePayment } from "@/types";

const schema = z.object({
  date: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  reason: z.string().optional(),
});

export type AdvanceFormValues = z.infer<typeof schema>;

interface AddAdvanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AdvanceFormValues) => void;
  isSubmitting?: boolean;
  initialData?: AdvancePayment | null;
}

export const AddAdvanceDialog = ({ open, onClose, onSubmit, isSubmitting, initialData }: AddAdvanceDialogProps) => {
  const { register, control, handleSubmit, reset } = useForm<AdvanceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: dayjs().format("YYYY-MM-DD"), amount: 0, reason: "" },
  });

  const isEdit = !!initialData;
  const amountLocked = isEdit && Number(initialData!.adjustedAmount) > 0;

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      reset({
        date: dayjs(initialData.date).format("YYYY-MM-DD"),
        amount: Number(initialData.amount),
        reason: initialData.reason ?? "",
      });
    } else {
      reset({ date: dayjs().format("YYYY-MM-DD"), amount: 0, reason: "" });
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? "Edit Advance" : "Record Advance"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          {amountLocked && (
            <Alert severity="info" sx={{ mb: 2 }}>
              This advance has already been partially adjusted against a salary run — its amount is locked. You
              can still correct the date or reason.
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Advance Date"
                    value={dayjs(field.value)}
                    onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Advance Amount"
                type="number"
                fullWidth
                disabled={amountLocked}
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("amount")}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Reason (optional)" fullWidth multiline minRows={2} {...register("reason")} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
