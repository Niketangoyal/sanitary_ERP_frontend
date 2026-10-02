import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { CustomerAutocomplete } from "@/components/CustomerAutocomplete";
import { PAYMENT_MODE_LABELS, ACCOUNT_TYPE_LABELS } from "@/utils/constants";
import type { Customer, Payment } from "@/types";

// Payments are a customer-ledger credit (Khata-style) — always against the
// customer's Cash or Bill account as a whole, never a specific invoice.
const paymentSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  date: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  mode: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"]),
  accountType: z.enum(["CASH", "BILL"]),
  remarks: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PaymentFormValues) => void;
  isSubmitting?: boolean;
  defaultCustomer?: Customer | null;
  initialData?: Payment | null;
}

export const PaymentFormDialog = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  defaultCustomer,
  initialData,
}: PaymentFormDialogProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(defaultCustomer ?? null);
  const isEdit = !!initialData;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customerId: defaultCustomer?.id ?? "",
      date: dayjs().format("YYYY-MM-DD"),
      amount: 0,
      mode: "CASH",
      accountType: "CASH",
      remarks: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setSelectedCustomer(initialData.customer ?? null);
      reset({
        customerId: initialData.customerId,
        date: dayjs(initialData.date).format("YYYY-MM-DD"),
        amount: Number(initialData.amount),
        mode: initialData.mode,
        accountType: initialData.accountType,
        remarks: initialData.remarks ?? "",
      });
    } else {
      setSelectedCustomer(defaultCustomer ?? null);
      reset({
        customerId: defaultCustomer?.id ?? "",
        date: dayjs().format("YYYY-MM-DD"),
        amount: 0,
        mode: "CASH",
        accountType: "CASH",
        remarks: "",
      });
    }
  }, [open, defaultCustomer, initialData, reset]);

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Payment" : "Record Payment"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              {isEdit ? (
                <TextField label="Customer" value={selectedCustomer?.companyName ?? ""} fullWidth disabled />
              ) : (
                <CustomerAutocomplete
                  value={selectedCustomer}
                  onChange={(customer) => {
                    setSelectedCustomer(customer);
                    setValue("customerId", customer?.id ?? "");
                  }}
                  error={!!errors.customerId}
                  helperText={errors.customerId?.message}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="date"
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                required
                error={!!errors.amount}
                helperText={errors.amount?.message}
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("amount")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Payment Mode" fullWidth>
                    {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="accountType"
                control={control}
                render={({ field }) => (
                  <ToggleButtonGroup
                    {...field}
                    exclusive
                    fullWidth
                    size="small"
                    onChange={(_e, val) => val && field.onChange(val)}
                  >
                    {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                      <ToggleButton key={value} value={value}>
                        {label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Remarks" fullWidth multiline minRows={2} {...register("remarks")} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Save Payment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
