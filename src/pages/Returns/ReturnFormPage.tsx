import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SaveIcon from "@mui/icons-material/Save";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageLoader";
import { CustomerAutocomplete } from "@/components/CustomerAutocomplete";
import { returnService } from "@/services/return.service";
import { saleService } from "@/services/sale.service";
import { getErrorMessage } from "@/api/axiosClient";
import { computeLineItem } from "@/utils/calc";
import { formatCurrency, formatNumber } from "@/utils/format";
import type { Customer, ReturnEligibleItem, Sale } from "@/types";

const formSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  saleId: z.string().min(1, "Select the original invoice"),
  returnDate: z.string().min(1, "Return date is required"),
  reason: z.string().optional(),
});

type ReturnFormValues = z.infer<typeof formSchema>;

interface ReturnRow extends ReturnEligibleItem {
  returnQty: number;
}

export const ReturnFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [rowsError, setRowsError] = useState<string | null>(null);

  const { data: existingReturn, isLoading: existingLoading } = useQuery({
    queryKey: ["returns", id],
    queryFn: () => returnService.getById(id as string),
    enabled: isEdit,
  });

  const { data: customerSales } = useQuery({
    queryKey: ["sales", "by-customer", selectedCustomer?.id],
    queryFn: () => saleService.list({ customerId: selectedCustomer!.id, limit: 50 }),
    enabled: !!selectedCustomer && !isEdit,
  });

  const { data: eligibleItems, isFetching: eligibleLoading } = useQuery({
    queryKey: ["returns", "eligible-items", selectedSale?.id, isEdit ? id : undefined],
    queryFn: () => returnService.eligibleItems(selectedSale!.id, isEdit ? id : undefined),
    enabled: !!selectedSale,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReturnFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      saleId: "",
      returnDate: dayjs().format("YYYY-MM-DD"),
      reason: "",
    },
  });

  // Prefill from the existing return in edit mode — customer & invoice are fixed.
  useEffect(() => {
    if (!existingReturn) return;
    setSelectedCustomer(existingReturn.customer ?? null);
    setSelectedSale(existingReturn.sale ?? null);
    reset({
      customerId: existingReturn.customerId,
      saleId: existingReturn.saleId ?? "",
      returnDate: dayjs(existingReturn.returnDate).format("YYYY-MM-DD"),
      reason: existingReturn.reason ?? "",
    });
  }, [existingReturn, reset]);

  useEffect(() => {
    const existingQtyByProduct = new Map(
      (existingReturn?.items ?? []).map((item) => [item.productId, Number(item.quantity)]),
    );
    setRows(
      (eligibleItems ?? []).map((item) => ({
        ...item,
        returnQty: existingQtyByProduct.get(item.productId) ?? 0,
      })),
    );
  }, [eligibleItems, existingReturn]);

  // Plain snapshot of form values, set on submit — read inside the mutation
  // closure since RHF's own state isn't convenient to pull from there.
  const [form, setForm] = useState<ReturnFormValues>({
    customerId: "",
    saleId: "",
    returnDate: dayjs().format("YYYY-MM-DD"),
    reason: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? returnService.update(id as string, {
            returnDate: form.returnDate,
            reason: form.reason || undefined,
            items: selectedRows.map((row) => ({
              productId: row.productId,
              quantity: row.returnQty,
              rate: row.rate,
              gstPercent: row.gstPercent,
            })),
          })
        : returnService.create({
            customerId: form.customerId,
            returnDate: form.returnDate,
            saleId: form.saleId,
            reason: form.reason || undefined,
            items: selectedRows.map((row) => ({
              productId: row.productId,
              quantity: row.returnQty,
              rate: row.rate,
              gstPercent: row.gstPercent,
            })),
          }),
    onSuccess: (ret) => {
      enqueueSnackbar(`Return ${ret.returnNumber} ${isEdit ? "updated" : "recorded"}`, { variant: "success" });
      navigate(isEdit ? `/returns/${ret.id}` : "/returns");
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleQtyChange = (productId: string, value: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.productId === productId
          ? { ...row, returnQty: Math.max(0, Math.min(value, row.quantityEligible)) }
          : row,
      ),
    );
    setRowsError(null);
  };

  const selectedRows = rows.filter((r) => r.returnQty > 0);
  const totals = selectedRows.reduce(
    (acc, row) => {
      const computed = computeLineItem({ quantity: row.returnQty, rate: row.rate, gstPercent: row.gstPercent });
      acc.subtotal += computed.taxable;
      acc.gstTotal += computed.gstAmount;
      acc.grandTotal += computed.total;
      return acc;
    },
    { subtotal: 0, gstTotal: 0, grandTotal: 0 },
  );

  const onSubmit = (values: ReturnFormValues) => {
    if (selectedRows.length === 0) {
      setRowsError("Enter a return quantity for at least one item");
      return;
    }
    setForm(values);
    mutation.mutate();
  };

  if (isEdit && existingLoading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title={isEdit ? `Edit Return ${existingReturn?.returnNumber ?? ""}` : "New Return"}
        subtitle="Products can only be returned against their original invoice"
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2.5 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 5 }}>
              {isEdit ? (
                <TextField label="Customer" value={selectedCustomer?.companyName ?? ""} fullWidth disabled />
              ) : (
                <CustomerAutocomplete
                  value={selectedCustomer}
                  onChange={(customer) => {
                    setSelectedCustomer(customer);
                    setSelectedSale(null);
                    setValue("customerId", customer?.id ?? "");
                    setValue("saleId", "");
                  }}
                  error={!!errors.customerId}
                  helperText={errors.customerId?.message}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              {isEdit ? (
                <TextField label="Original Invoice" value={selectedSale?.invoiceNumber ?? ""} fullWidth disabled />
              ) : (
                <Autocomplete
                  options={customerSales?.data ?? []}
                  value={selectedSale}
                  disabled={!selectedCustomer}
                  onChange={(_e, val) => {
                    setSelectedSale(val);
                    setValue("saleId", val?.id ?? "");
                  }}
                  getOptionLabel={(option) => option.invoiceNumber}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Original Invoice"
                      required
                      error={!!errors.saleId}
                      helperText={errors.saleId?.message}
                    />
                  )}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Controller
                name="returnDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Return Date"
                    value={dayjs(field.value)}
                    onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.returnDate,
                        helperText: errors.returnDate?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Reason" fullWidth {...register("reason")} />
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2.5 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Eligible Items
          </Typography>

          {!selectedSale && (
            <Typography color="text.secondary">Select a customer and invoice to see returnable items.</Typography>
          )}

          {selectedSale && eligibleLoading && <PageLoader />}

          {selectedSale && !eligibleLoading && rows.length === 0 && (
            <Typography color="text.secondary">This invoice has no items.</Typography>
          )}

          {selectedSale && !eligibleLoading && rows.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 200 }}>Product</TableCell>
                    <TableCell align="right">Sold</TableCell>
                    <TableCell align="right">Already Returned</TableCell>
                    <TableCell align="right">Eligible</TableCell>
                    <TableCell width={120}>Return Qty</TableCell>
                    <TableCell align="right" width={130}>
                      Line Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const computed = computeLineItem({
                      quantity: row.returnQty,
                      rate: row.rate,
                      gstPercent: row.gstPercent,
                    });
                    return (
                      <TableRow key={row.productId} hover>
                        <TableCell>
                          {row.itemName}
                          {row.quantityEligible <= 0 && (
                            <Chip label="Fully returned" size="small" sx={{ ml: 1 }} />
                          )}
                        </TableCell>
                        <TableCell align="right">{formatNumber(row.quantitySold)}</TableCell>
                        <TableCell align="right">{formatNumber(row.quantityReturned)}</TableCell>
                        <TableCell align="right">{formatNumber(row.quantityEligible)}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            fullWidth
                            disabled={row.quantityEligible <= 0}
                            value={row.returnQty}
                            onChange={(e) => handleQtyChange(row.productId, Number(e.target.value))}
                            slotProps={{ htmlInput: { step: "0.01", min: 0, max: row.quantityEligible } }}
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(computed.total)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {rowsError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {rowsError}
            </Alert>
          )}
        </Paper>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 7 }} />
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>{formatCurrency(totals.subtotal)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">GST</Typography>
                  <Typography>+ {formatCurrency(totals.gstTotal)}</Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}
                >
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
                <Button onClick={() => navigate("/returns")}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={isSubmitting}>
                  Save Return
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default ReturnFormPage;
