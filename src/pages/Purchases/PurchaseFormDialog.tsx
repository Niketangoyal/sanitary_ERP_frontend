import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ProductAutocomplete } from "@/components/ProductAutocomplete";
import { supplierService } from "@/services/supplier.service";
import type { Product, StockBatch, Supplier } from "@/types";

const purchaseSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  purchasePrice: z.coerce.number().positive("Purchase price is required"),
  quantity: z.coerce.number().positive("Quantity is required"),
  purchaseDate: z.string().min(1),
  supplierId: z.string().optional().nullable(),
  supplier: z.string().optional(),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PurchaseFormValues) => void;
  isSubmitting?: boolean;
  initialData?: StockBatch | null;
}

export const PurchaseFormDialog = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}: PurchaseFormDialogProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers", "all"],
    queryFn: () => supplierService.list({ limit: 200, isActive: "true" }),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      productId: "",
      purchasePrice: 0,
      quantity: 0,
      purchaseDate: dayjs().format("YYYY-MM-DD"),
      supplierId: null,
      supplier: "",
    },
  });

  const isEdit = !!initialData;
  const locked = isEdit && !toNumberEqual(initialData!.quantity, initialData!.quantityRemaining);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setSelectedProduct(initialData.product ?? null);
      setSelectedSupplier(initialData.supplierRef ?? null);
      reset({
        productId: initialData.productId,
        purchasePrice: Number(initialData.purchasePrice),
        quantity: Number(initialData.quantity),
        purchaseDate: dayjs(initialData.purchaseDate).format("YYYY-MM-DD"),
        supplierId: initialData.supplierId,
        supplier: initialData.supplier ?? "",
      });
    } else {
      setSelectedProduct(null);
      setSelectedSupplier(null);
      reset({
        productId: "",
        purchasePrice: 0,
        quantity: 0,
        purchaseDate: dayjs().format("YYYY-MM-DD"),
        supplierId: null,
        supplier: "",
      });
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Purchase" : "Record Purchase"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          {locked && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Some of this batch has already been sold — price and quantity are locked. You can still correct
              the supplier or purchase date.
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={12}>
              {isEdit ? (
                <TextField label="Product" value={initialData?.product?.itemName ?? ""} fullWidth disabled />
              ) : (
                <>
                  <ProductAutocomplete
                    value={selectedProduct}
                    onChange={(product) => {
                      setSelectedProduct(product);
                      setValue("productId", product?.id ?? "");
                      if (product) setValue("purchasePrice", Number(product.purchasePrice));
                    }}
                  />
                  {errors.productId && (
                    <span style={{ color: "#D23C3C", fontSize: 12 }}>{errors.productId.message}</span>
                  )}
                </>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Purchase Price (per unit)"
                type="number"
                fullWidth
                required
                disabled={locked}
                error={!!errors.purchasePrice}
                helperText={errors.purchasePrice?.message}
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("purchasePrice")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                required
                disabled={locked}
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("quantity")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="purchaseDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Purchase Date"
                    value={dayjs(field.value)}
                    onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={suppliers?.data ?? []}
                value={selectedSupplier}
                onChange={(_e, val) => {
                  setSelectedSupplier(val);
                  setValue("supplierId", val?.id ?? null);
                  setValue("supplier", val?.name ?? "");
                }}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                onInputChange={(_e, val, reason) => {
                  if (reason === "input") setValue("supplier", val);
                }}
                renderInput={(params) => <TextField {...params} label="Supplier" />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Save Purchase
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const toNumberEqual = (a: string, b: string) => Number(a) === Number(b);

export default PurchaseFormDialog;
