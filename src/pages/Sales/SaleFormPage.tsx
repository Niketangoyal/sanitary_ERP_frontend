import { useEffect, useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import {
  Alert,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageLoader";
import { CustomerAutocomplete } from "@/components/CustomerAutocomplete";
import { ProductAutocomplete } from "@/components/ProductAutocomplete";
import { saleService } from "@/services/sale.service";
import { getErrorMessage } from "@/api/axiosClient";
import { computeLineItem } from "@/utils/calc";
import { formatCurrency } from "@/utils/format";
import { PAYMENT_MODE_LABELS, SALE_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/utils/constants";
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
  saleType: z.enum(["CASH", "BILL"]),
  paymentStatus: z.enum(["PAID", "UNPAID", "PARTIAL"]),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"]).optional(),
  amountPaid: z.coerce.number().min(0).optional(),
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
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: existingSale, isLoading: existingLoading } = useQuery({
    queryKey: ["sales", id],
    queryFn: () => saleService.getById(id as string),
    enabled: isEdit,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerId: "",
      invoiceDate: dayjs().format("YYYY-MM-DD"),
      saleType: "BILL",
      paymentStatus: "UNPAID",
      paymentMethod: undefined,
      amountPaid: 0,
      notes: "",
      items: [emptyItem],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");
  const paymentStatus = watch("paymentStatus");
  const amountPaidInput = watch("amountPaid") ?? 0;

  useEffect(() => {
    if (!existingSale) return;
    setSelectedCustomer(existingSale.customer ?? null);
    reset({
      customerId: existingSale.customerId,
      invoiceDate: dayjs(existingSale.invoiceDate).format("YYYY-MM-DD"),
      saleType: existingSale.saleType,
      paymentStatus: existingSale.paymentStatus,
      paymentMethod: existingSale.paymentMethod ?? undefined,
      amountPaid: Number(existingSale.amountPaid),
      notes: existingSale.notes ?? "",
      items: (existingSale.items ?? []).map((item) => ({
        productId: item.productId,
        itemName: item.itemName,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discountPercent: Number(item.discountPercent),
        gstPercent: Number(item.gstPercent),
      })),
    });
  }, [existingSale, reset]);

  const mutation = useMutation({
    mutationFn: (values: SaleFormValues) =>
      isEdit
        ? saleService.update(id as string, {
            invoiceDate: values.invoiceDate,
            saleType: values.saleType,
            paymentStatus: values.paymentStatus,
            paymentMethod: values.paymentStatus === "UNPAID" ? undefined : values.paymentMethod,
            amountPaid: values.paymentStatus === "UNPAID" ? 0 : values.amountPaid,
            notes: values.notes || undefined,
            items: values.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              rate: item.rate,
              discountPercent: item.discountPercent,
              gstPercent: item.gstPercent,
            })),
          })
        : saleService.create({
            customerId: values.customerId,
            invoiceDate: values.invoiceDate,
            saleType: values.saleType,
            paymentStatus: values.paymentStatus,
            paymentMethod: values.paymentStatus === "UNPAID" ? undefined : values.paymentMethod,
            amountPaid: values.paymentStatus === "UNPAID" ? 0 : values.amountPaid,
            notes: values.notes || undefined,
            items: values.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              rate: item.rate,
              discountPercent: item.discountPercent,
              gstPercent: item.gstPercent,
            })),
          }),
    onSuccess: (sale) => {
      enqueueSnackbar(`Invoice ${sale.invoiceNumber} ${isEdit ? "updated" : "created"}`, { variant: "success" });
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

  const effectiveAmountPaid =
    paymentStatus === "PAID" ? totals.grandTotal : paymentStatus === "PARTIAL" ? amountPaidInput : 0;
  const balanceDue = Math.max(0, totals.grandTotal - effectiveAmountPaid);

  const handleProductSelect = (index: number, product: Product | null) => {
    setValue(`items.${index}.productId`, product?.id ?? "");
    setValue(`items.${index}.itemName`, product?.itemName ?? "");
    if (product) {
      setValue(`items.${index}.rate`, Number(product.sellingPrice));
      setValue(`items.${index}.gstPercent`, Number(product.gstPercent));
    }
  };

  const onSubmit = (values: SaleFormValues) => {
    if (values.paymentStatus === "PARTIAL") {
      if (!values.amountPaid || values.amountPaid <= 0 || values.amountPaid >= totals.grandTotal) {
        setError("amountPaid", {
          message: "Must be greater than 0 and less than the grand total",
        });
        return;
      }
    }

    mutation.mutate(values);
  };

  if (isEdit && existingLoading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title={isEdit ? `Edit Invoice ${existingSale?.invoiceNumber ?? ""}` : "Create Invoice"}
        subtitle={isEdit ? "Corrections reverse and repost inventory + ledger effects" : "Record a new sale for a customer"}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2.5 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 3 }}>
              <Controller
                name="saleType"
                control={control}
                render={({ field }) => (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Sale Type *
                    </Typography>
                    <ToggleButtonGroup
                      {...field}
                      exclusive
                      fullWidth
                      size="small"
                      onChange={(_e, val) => val && field.onChange(val)}
                    >
                      <ToggleButton value="BILL">{SALE_TYPE_LABELS.BILL}</ToggleButton>
                      <ToggleButton value="CASH">{SALE_TYPE_LABELS.CASH}</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="paymentStatus"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Payment Status" fullWidth required>
                    {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            {paymentStatus !== "UNPAID" && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ""}
                        select
                        label="Payment Method"
                        fullWidth
                        required
                        error={!!errors.paymentMethod}
                        helperText={errors.paymentMethod?.message}
                      >
                        {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  {paymentStatus === "PAID" ? (
                    <TextField
                      label="Amount Paid"
                      value={formatCurrency(totals.grandTotal)}
                      fullWidth
                      disabled
                      helperText="Full invoice amount"
                    />
                  ) : (
                    <TextField
                      label="Amount Paid"
                      type="number"
                      fullWidth
                      required
                      error={!!errors.amountPaid}
                      helperText={errors.amountPaid?.message}
                      slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                      {...register("amountPaid")}
                    />
                  )}
                </Grid>
              </>
            )}
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
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Amount Paid</Typography>
                  <Typography color="success.main">{formatCurrency(effectiveAmountPaid)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2">Balance Due</Typography>
                  <Typography variant="subtitle2" color={balanceDue > 0 ? "warning.main" : "success.main"}>
                    {formatCurrency(balanceDue)}
                  </Typography>
                </Stack>
              </Stack>

              {mutation.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {getErrorMessage(mutation.error)}
                </Alert>
              )}

              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button onClick={() => navigate("/sales")} disabled={mutation.isPending}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={mutation.isPending}>
                  {isEdit ? "Save Changes" : "Save Invoice"}
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
