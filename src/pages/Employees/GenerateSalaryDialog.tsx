import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { MONTH_LABELS } from "@/utils/constants";
import { advanceService } from "@/services/advance.service";
import { formatCurrency } from "@/utils/format";

const schema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  advanceAdjustment: z.coerce.number().min(0).default(0),
});

export type GenerateSalaryFormValues = z.infer<typeof schema>;

interface GenerateSalaryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: GenerateSalaryFormValues) => void;
  isSubmitting?: boolean;
  employeeId: string;
}

export const GenerateSalaryDialog = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  employeeId,
}: GenerateSalaryDialogProps) => {
  const { control, register, handleSubmit, reset } = useForm<GenerateSalaryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { month: dayjs().month() + 1, year: dayjs().year(), advanceAdjustment: 0 },
  });

  const { data: pending } = useQuery({
    queryKey: ["advances", "pending-summary", employeeId],
    queryFn: () => advanceService.pendingSummary(employeeId),
    enabled: open,
  });

  useEffect(() => {
    if (open) reset({ month: dayjs().month() + 1, year: dayjs().year(), advanceAdjustment: 0 });
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Generate Salary</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Controller
                name="month"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Month" fullWidth>
                    {MONTH_LABELS.map((label, index) => (
                      <MenuItem key={label} value={index + 1}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="year"
                control={control}
                render={({ field }) => <TextField {...field} type="number" label="Year" fullWidth />}
              />
            </Grid>
            {pending && pending.totalPending > 0 && (
              <>
                <Grid size={12}>
                  <Alert severity="info">
                    Pending Advance Balance: {formatCurrency(pending.totalPending)}
                  </Alert>
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Advance Adjustment This Month"
                    type="number"
                    fullWidth
                    helperText={`0 to ${formatCurrency(pending.totalPending)} — full, partial, or none`}
                    slotProps={{ htmlInput: { step: "0.01", min: 0, max: pending.totalPending } }}
                    {...register("advanceAdjustment")}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Generate
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
