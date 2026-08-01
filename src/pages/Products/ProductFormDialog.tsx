import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import type { Product } from "@/types";

const productSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  brand: z.string().optional(),
  category: z.string().optional(),
  specification: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  purchasePrice: z.coerce.number().min(0, "Must be 0 or more"),
  sellingPrice: z.coerce.number().min(0.01, "Selling price is required"),
  gstPercent: z.coerce.number().min(0).max(100),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type ProductFormValues = z.infer<typeof productSchema>;

const UNITS = ["PCS", "SET", "BOX", "PAIR", "DOZEN", "MTR", "KG"];

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
  initialData?: Product | null;
  isSubmitting?: boolean;
}

export const ProductFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: ProductFormDialogProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      itemName: "",
      brand: "",
      category: "",
      specification: "",
      unit: "PCS",
      purchasePrice: 0,
      sellingPrice: 0,
      gstPercent: 18,
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              itemName: initialData.itemName,
              brand: initialData.brand ?? "",
              category: initialData.category ?? "",
              specification: initialData.specification ?? "",
              unit: initialData.unit,
              purchasePrice: Number(initialData.purchasePrice),
              sellingPrice: Number(initialData.sellingPrice),
              gstPercent: Number(initialData.gstPercent),
              status: initialData.status,
            }
          : {
              itemName: "",
              brand: "",
              category: "",
              specification: "",
              unit: "PCS",
              purchasePrice: 0,
              sellingPrice: 0,
              gstPercent: 18,
              status: "ACTIVE",
            },
      );
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "Edit Product" : "Add Product"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="Item Name"
                fullWidth
                required
                error={!!errors.itemName}
                helperText={errors.itemName?.message}
                {...register("itemName")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Brand" fullWidth {...register("brand")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Category" fullWidth {...register("category")} />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Specification"
                fullWidth
                multiline
                minRows={2}
                {...register("specification")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Unit" fullWidth>
                    {UNITS.map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Purchase Price"
                type="number"
                fullWidth
                error={!!errors.purchasePrice}
                helperText={errors.purchasePrice?.message}
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("purchasePrice")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Selling Price"
                type="number"
                fullWidth
                required
                error={!!errors.sellingPrice}
                helperText={errors.sellingPrice?.message}
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("sellingPrice")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="GST %"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("gstPercent")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {initialData ? "Save Changes" : "Add Product"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
