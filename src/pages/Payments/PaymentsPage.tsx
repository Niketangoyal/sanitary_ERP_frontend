import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
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
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);

  const { data, meta, isLoading, setPage, setRowsPerPage } = usePaginatedQuery({
    queryKey: "payments",
    fetcher: paymentService.list,
  });

  const createMutation = useMutation({
    mutationFn: (values: PaymentFormValues) =>
      paymentService.create({ ...values, remarks: values.remarks || undefined }),
    onSuccess: (payment) => {
      enqueueSnackbar(`Payment ${payment.paymentNumber} recorded`, { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setFormOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

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
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Cash, UPI, bank & cheque receipts from customers"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Record Payment
          </Button>
        }
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
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => createMutation.mutate(values)}
        isSubmitting={createMutation.isPending}
      />
    </>
  );
};

export default PaymentsPage;
