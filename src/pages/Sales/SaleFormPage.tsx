import { useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import {
  Alert,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import { PageHeader } from "@/components/PageHeader";
import { CustomerAutocomplete } from "@/components/CustomerAutocomplete";
import { ProductAutocomplete } from "@/components/ProductAutocomplete";
import { saleService } from "@/services/sale.service";
import { getErrorMessage } from "@/api/axiosClient";
import { computeLineItem } from "@/utils/calc";
import { formatCurrency } from "@/utils/format";
import type { Customer, Product } from "@/types";

const saleItemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  itemName: z.string(),
  quantity: z.coerce.number().positive("Qty required"),
  rate: z.coerce.number().min(0, "Rate required"),
  discountPercent: z.coerce.number().min(0).max(100),
  gstPercent: z.coerce.number().min(0).max(100),
});

const saleFormSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "Add at least one item"),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

const emptyItem = {
  productId: "",
  itemName: "",
  quantity: 1,
  rate: 0,
  discountPercent: 0,
  gstPercent: 0,
};

export const SaleFormPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerId: "",
      invoiceDate: dayjs().format("YYYY-MM-DD"),
      notes: "",
      items: [emptyItem],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  const mutation = useMutation({
    mutationFn: saleService.create,
    onSuccess: (sale) => {
      enqueueSnackbar(`Invoice ${sale.invoiceNumber} created`, { variant: "success" });
      navigate(`/sales/${sale.id}`);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const totals = watchedItems.reduce(
    (acc, item) => {
      const computed = computeLineItem(item);
      acc.subtotal += computed.taxable;
      acc.discountTotal += computed.discountAmount;
      acc.gstTotal += computed.gstAmount;
      acc.grandTotal += computed.total;
      return acc;
    },
    { subtotal: 0, discountTotal: 0, gstTotal: 0, grandTotal: 0 },
  );

  const handleProductSelect = (index: number, product: Product | null) => {
    setValue(`items.${index}.productId`, product?.id ?? "");
    setValue(`items.${index}.itemName`, product?.itemName ?? "");
    if (product) {
      setValue(`items.${index}.rate`, Number(product.sellingPrice));
      setValue(`items.${index}.gstPercent`, Number(product.gstPercent));
    }
  };

  const onSubmit = (values: SaleFormValues) => {
    mutation.mutate({
      customerId: values.customerId,
      invoiceDate: values.invoiceDate,
      notes: values.notes || undefined,
      items: values.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        rate: item.rate,
        discountPercent: item.discountPercent,
        gstPercent: item.gstPercent,
      })),
    });
  };

  return (
    <>
      <PageHeader title="Create Invoice" subtitle="Record a new sale for a customer" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2.5 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomerAutocomplete
                value={selectedCustomer}
                onChange={(customer) => {
                  setSelectedCustomer(customer);
                  setValue("customerId", customer?.id ?? "");
                }}
                error={!!errors.customerId}
                helperText={errors.customerId?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Controller
                name="invoiceDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Invoice Date"
                    value={dayjs(field.value)}
                    onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.invoiceDate,
                        helperText: errors.invoiceDate?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Items</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => append(emptyItem)}
            >
              Add Item
            </Button>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 220 }}>Product</TableCell>
                  <TableCell width={100}>Qty</TableCell>
                  <TableCell width={120}>Rate</TableCell>
                  <TableCell width={110}>Disc %</TableCell>
                  <TableCell width={100}>GST %</TableCell>
                  <TableCell width={130} align="right">
                    Total
                  </TableCell>
                  <TableCell width={50} />
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => {
                  const item = watchedItems[index];
                  const computed = computeLineItem(item ?? emptyItem);
                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <ProductAutocomplete
                          value={
                            item?.productId
                              ? ({ id: item.productId, itemName: item.itemName } as Product)
                              : null
                          }
                          onChange={(product) => handleProductSelect(index, product)}
                        />
                        {errors.items?.[index]?.productId && (
                          <Typography variant="caption" color="error">
                            {errors.items[index]?.productId?.message}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                          {...register(`items.${index}.quantity`)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                          {...register(`items.${index}.rate`)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          slotProps={{ htmlInput: { step: "0.01", min: 0, max: 100 } }}
                          {...register(`items.${index}.discountPercent`)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          fullWidth
                          slotProps={{ htmlInput: { step: "0.01", min: 0, max: 100 } }}
                          {...register(`items.${index}.gstPercent`)}
                        />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(computed.total)}</TableCell>
                      <TableCell>
                        <Tooltip title="Remove">
                          <span>
                            <IconButton
                              size="small"
                              disabled={fields.length === 1}
                              onClick={() => remove(index)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {errors.items && typeof errors.items.message === "string" && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.items.message}
            </Alert>
          )}
        </Paper>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                minRows={4}
                placeholder="Optional notes for this invoice..."
                {...register("notes")}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>{formatCurrency(totals.subtotal)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Discount</Typography>
                  <Typography>- {formatCurrency(totals.discountTotal)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">GST</Typography>
                  <Typography>+ {formatCurrency(totals.gstTotal)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}>
                  <Typography variant="subtitle1">Grand Total</Typography>
                  <Typography variant="subtitle1" color="primary.main">
                    {formatCurrency(totals.grandTotal)}
                  </Typography>
                </Stack>
              </Stack>

              {mutation.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {getErrorMessage(mutation.error)}
                </Alert>
              )}

              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button onClick={() => navigate("/sales")}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={isSubmitting}>
                  Save Invoice
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default SaleFormPage;
