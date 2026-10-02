import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LEAVE_TYPE_LABELS } from "@/utils/constants";
import type { LeaveRecord } from "@/types";

const schema = z
  .object({
    leaveType: z.enum(["CASUAL", "SICK", "PAID", "UNPAID", "OTHER"]),
    fromDate: z.string().min(1),
    toDate: z.string().min(1),
    reason: z.string().optional(),
  })
  .refine((data) => data.toDate >= data.fromDate, {
    message: "To Date must be on or after From Date",
    path: ["toDate"],
  });

export type LeaveFormValues = z.infer<typeof schema>;

interface LeaveFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: LeaveFormValues) => void;
  isSubmitting?: boolean;
  initialData?: LeaveRecord | null;
}

export const LeaveFormDialog = ({ open, onClose, onSubmit, isSubmitting, initialData }: LeaveFormDialogProps) => {
  const { register, control, handleSubmit, reset } = useForm<LeaveFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      leaveType: "CASUAL",
      fromDate: dayjs().format("YYYY-MM-DD"),
      toDate: dayjs().format("YYYY-MM-DD"),
      reason: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              leaveType: initialData.leaveType,
              fromDate: dayjs(initialData.fromDate).format("YYYY-MM-DD"),
              toDate: dayjs(initialData.toDate).format("YYYY-MM-DD"),
              reason: initialData.reason ?? "",
            }
          : {
              leaveType: "CASUAL",
              fromDate: dayjs().format("YYYY-MM-DD"),
              toDate: dayjs().format("YYYY-MM-DD"),
              reason: "",
            },
      );
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{initialData ? "Edit Leave" : "Add Leave"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller
                name="leaveType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Leave Type" fullWidth>
                    {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="fromDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="From Date"
                    value={dayjs(field.value)}
                    onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="toDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="To Date"
                    value={dayjs(field.value)}
                    onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Reason / Remarks" fullWidth multiline minRows={2} {...register("reason")} />
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
