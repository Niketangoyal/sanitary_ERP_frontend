import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, Chip, IconButton, InputAdornment, Stack, TextField, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { paymentService } from "@/services/payment.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency, formatDate } from "@/utils/format";
import { PAYMENT_MODE_LABELS, ACCOUNT_TYPE_LABELS } from "@/utils/constants";
import type { Payment } from "@/types";
import { PaymentFormDialog } from "./PaymentFormDialog";
import type { PaymentFormValues } from "./PaymentFormDialog";

export const PaymentsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, meta, isLoading, filters, setFilters, setPage, setRowsPerPage } = usePaginatedQuery({
    queryKey: "payments",
    fetcher: paymentService.list,
  });

  useMemo(() => {
    if (debouncedSearch !== (filters.search ?? "")) {
      setFilters({ search: debouncedSearch || undefined } as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["payments"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    queryClient.invalidateQueries({ queryKey: ["sales"] });
    queryClient.invalidateQueries({ queryKey: ["ledger"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: PaymentFormValues) =>
      paymentService.create({ ...values, remarks: values.remarks || undefined }),
    onSuccess: (payment) => {
      enqueueSnackbar(`Payment ${payment.paymentNumber} recorded`, { variant: "success" });
      invalidate();
      setFormOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: PaymentFormValues }) =>
      paymentService.update(id, { ...values, remarks: values.remarks || undefined }),
    onSuccess: (payment) => {
      enqueueSnackbar(`Payment ${payment.paymentNumber} updated`, { variant: "success" });
      invalidate();
      setFormOpen(false);
      setEditingPayment(null);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentService.remove(id),
    onSuccess: () => {
      enqueueSnackbar("Payment deleted", { variant: "success" });
      invalidate();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async (payment: Payment) => {
    const ok = await confirm({
      title: "Delete Payment",
      message: `Delete payment ${payment.paymentNumber} of ${formatCurrency(payment.amount)}? This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(payment.id);
  };

  const handleFormSubmit = (values: PaymentFormValues) => {
    if (editingPayment) {
      updateMutation.mutate({ id: editingPayment.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = useMemo<ColumnDef<Payment, any>[]>(
    () => [
      { accessorKey: "paymentNumber", header: "Payment #" },
      { accessorKey: "date", header: "Date", cell: (c) => formatDate(c.getValue() as string) },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => row.original.customer?.companyName ?? "-",
      },
      {
        accessorKey: "mode",
        header: "Mode",
        cell: (c) => <Chip size="small" label={PAYMENT_MODE_LABELS[c.getValue() as string]} />,
      },
      {
        accessorKey: "accountType",
        header: "Account",
        cell: (c) => (
          <Chip
            size="small"
            variant="outlined"
            label={ACCOUNT_TYPE_LABELS[c.getValue() as string]}
          />
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (c) => formatCurrency(c.getValue() as string),
      },
      { accessorKey: "remarks", header: "Remarks", cell: (c) => c.getValue() ?? "-" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setEditingPayment(row.original);
                  setFormOpen(true);
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => handleDelete(row.original)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Cash, UPI, bank & cheque receipts from customers"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingPayment(null);
              setFormOpen(true);
            }}
          >
            Record Payment
          </Button>
        }
      />

      <TextField
        placeholder="Search by payment number or customer..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        sx={{ mb: 2, maxWidth: 420 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <DataTable
        columns={columns}
        data={data}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        emptyMessage="No payments recorded yet."
      />

      <PaymentFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingPayment(null);
        }}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        initialData={editingPayment}
      />

      {ConfirmDialog}
    </>
  );
};

export default PaymentsPage;
