import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { advanceService } from "@/services/advance.service";
import { formatCurrency } from "@/utils/format";
import type { SalaryRecord } from "@/types";

const schema = z.object({
  advanceAdjustment: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

export type EditSalaryRecordFormValues = z.infer<typeof schema>;

interface EditSalaryRecordDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EditSalaryRecordFormValues) => void;
  isSubmitting?: boolean;
  record: SalaryRecord | null;
}

export const EditSalaryRecordDialog = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  record,
}: EditSalaryRecordDialogProps) => {
  const { register, handleSubmit, reset } = useForm<EditSalaryRecordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { advanceAdjustment: 0, notes: "" },
  });

  const { data: pending } = useQuery({
    queryKey: ["advances", "pending-summary", record?.employeeId],
    queryFn: () => advanceService.pendingSummary(record!.employeeId),
    enabled: open && !!record,
  });

  useEffect(() => {
    if (open && record) {
      reset({ advanceAdjustment: Number(record.advanceDeduction), notes: record.notes ?? "" });
    }
  }, [open, record, reset]);

  const netBeforeAdvance = record ? Number(record.grossSalary) - Number(record.leaveDeduction) : 0;
  // Editing reverses this record's own deduction first, so headroom = current pending + what this record already holds.
  const availableForAdjustment = (pending?.totalPending ?? 0) + Number(record?.advanceDeduction ?? 0);
  const maxAdjustment = Math.min(netBeforeAdvance, availableForAdjustment);

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Salary Record</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Alert severity="info">
                Gross Salary − Leave Deduction is locked at {formatCurrency(netBeforeAdvance)}. Only the advance
                deduction and notes can be corrected before any installment is paid.
              </Alert>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Advance Adjustment"
                type="number"
                fullWidth
                helperText={`0 to ${formatCurrency(maxAdjustment)}`}
                slotProps={{ htmlInput: { step: "0.01", min: 0, max: maxAdjustment } }}
                {...register("advanceAdjustment")}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Notes" fullWidth multiline minRows={2} {...register("notes")} />
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

export default EditSalaryRecordDialog;
