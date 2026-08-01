import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Chip, Paper, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { ReportToolbar } from "@/components/ReportToolbar";
import { useRememberedFilters } from "@/hooks/useRememberedFilters";
import { reportService } from "@/services/report.service";
import { pdfService } from "@/services/pdf.service";
import { formatCurrency, formatDate } from "@/utils/format";
import { PAYMENT_MODE_LABELS, ACCOUNT_TYPE_LABELS } from "@/utils/constants";
import type { Customer, Payment } from "@/types";

export const PaymentsReportTab = () => {
  const [filters, setFilters] = useRememberedFilters("reports-payments", {
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });
  const [customer, setCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "payments", filters.from, filters.to, customer?.id],
    queryFn: () => reportService.payments({ ...filters, customerId: customer?.id }),
  });

  const columns = useMemo<ColumnDef<Payment, any>[]>(
    () => [
      { accessorKey: "paymentNumber", header: "Payment #" },
      { accessorKey: "date", header: "Date", cell: (c) => formatDate(c.getValue() as string) },
      { id: "customer", header: "Customer", cell: ({ row }) => row.original.customer?.companyName ?? "-" },
      {
        accessorKey: "mode",
        header: "Mode",
        cell: (c) => <Chip size="small" label={PAYMENT_MODE_LABELS[c.getValue() as string]} />,
      },
      {
        accessorKey: "accountType",
        header: "Account",
        cell: (c) => <Chip size="small" variant="outlined" label={ACCOUNT_TYPE_LABELS[c.getValue() as string]} />,
      },
      { accessorKey: "amount", header: "Amount", cell: (c) => formatCurrency(c.getValue() as string) },
    ],
    [],
  );

  return (
    <>
      <DateRangeFilter from={filters.from} to={filters.to} onChange={setFilters} customer={customer} onCustomerChange={setCustomer} />
      <ReportToolbar onExportPdf={() => pdfService.downloadReport("payments", { ...filters, customerId: customer?.id }, "Payments-Report.pdf")} />

      {data && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
          <Stack direction="row" spacing={4}>
            <Stack>
              <Typography variant="caption" color="text.secondary">Payments</Typography>
              <Typography variant="h6">{data.count}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">Total Collected</Typography>
              <Typography variant="h6" color="success.main">{formatCurrency(data.totals)}</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      <DataTable columns={columns} data={data?.rows ?? []} isLoading={isLoading} emptyMessage="No payments in this date range." />
    </>
  );
};

export default PaymentsReportTab;
