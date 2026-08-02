import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import type { Supplier } from "@/types";

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contactPerson: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SupplierFormValues) => void;
  initialData?: Supplier | null;
  isSubmitting?: boolean;
}

const emptyValues: SupplierFormValues = {
  name: "",
  contactPerson: "",
  mobile: "",
  address: "",
  gstNumber: "",
  notes: "",
};

export const SupplierFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: SupplierFormDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              name: initialData.name,
              contactPerson: initialData.contactPerson ?? "",
              mobile: initialData.mobile ?? "",
              address: initialData.address ?? "",
              gstNumber: initialData.gstNumber ?? "",
              notes: initialData.notes ?? "",
            }
          : emptyValues,
      );
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="Supplier Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register("name")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Contact Person" fullWidth {...register("contactPerson")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Mobile" fullWidth {...register("mobile")} />
            </Grid>
            <Grid size={12}>
              <TextField label="Address" fullWidth multiline minRows={2} {...register("address")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="GST Number" fullWidth {...register("gstNumber")} />
            </Grid>
            <Grid size={12}>
              <TextField label="Notes" fullWidth multiline minRows={2} {...register("notes")} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {initialData ? "Save Changes" : "Add Supplier"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SupplierFormDialog;
