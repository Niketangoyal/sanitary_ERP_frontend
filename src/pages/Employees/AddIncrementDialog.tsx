import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const schema = z.object({
  newSalary: z.coerce.number().positive("New salary is required"),
  effectiveDate: z.string().min(1),
  reason: z.string().optional(),
});

export type IncrementFormValues = z.infer<typeof schema>;

interface AddIncrementDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IncrementFormValues) => void;
  isSubmitting?: boolean;
}

export const AddIncrementDialog = ({ open, onClose, onSubmit, isSubmitting }: AddIncrementDialogProps) => {
  const { register, control, handleSubmit } = useForm<IncrementFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newSalary: 0, effectiveDate: dayjs().format("YYYY-MM-DD"), reason: "" },
  });

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Salary Increment</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="New Salary"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("newSalary")}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="effectiveDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Effective Date"
                    value={dayjs(field.value)}
                    onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Reason (optional)" fullWidth multiline minRows={2} {...register("reason")} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
