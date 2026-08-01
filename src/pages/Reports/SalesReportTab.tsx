import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Paper, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { ReportToolbar } from "@/components/ReportToolbar";
import { useRememberedFilters } from "@/hooks/useRememberedFilters";
import { reportService } from "@/services/report.service";
import { pdfService } from "@/services/pdf.service";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Customer, Sale } from "@/types";

export const SalesReportTab = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useRememberedFilters("reports-sales", {
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });
  const [customer, setCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "sales", filters.from, filters.to, customer?.id],
    queryFn: () => reportService.sales({ ...filters, customerId: customer?.id }),
  });

  const columns = useMemo<ColumnDef<Sale, any>[]>(
    () => [
      { accessorKey: "invoiceNumber", header: "Invoice #" },
      { accessorKey: "invoiceDate", header: "Date", cell: (c) => formatDate(c.getValue() as string) },
      { id: "customer", header: "Customer", cell: ({ row }) => row.original.customer?.companyName ?? "-" },
      { accessorKey: "subtotal", header: "Subtotal", cell: (c) => formatCurrency(c.getValue() as string) },
      { accessorKey: "discountTotal", header: "Discount", cell: (c) => formatCurrency(c.getValue() as string) },
      { accessorKey: "gstTotal", header: "GST", cell: (c) => formatCurrency(c.getValue() as string) },
      { accessorKey: "grandTotal", header: "Grand Total", cell: (c) => formatCurrency(c.getValue() as string) },
    ],
    [],
  );

  return (
    <>
      <DateRangeFilter from={filters.from} to={filters.to} onChange={setFilters} customer={customer} onCustomerChange={setCustomer} />
      <ReportToolbar onExportPdf={() => pdfService.downloadReport("sales", { ...filters, customerId: customer?.id }, "Sales-Report.pdf")} />

      {data && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
          <Stack direction="row" spacing={4} flexWrap="wrap">
            <Stack>
              <Typography variant="caption" color="text.secondary">Invoices</Typography>
              <Typography variant="h6">{data.count}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">Total Discount</Typography>
              <Typography variant="h6">{formatCurrency(data.totals.discountTotal)}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">Total GST</Typography>
              <Typography variant="h6">{formatCurrency(data.totals.gstTotal)}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">Grand Total</Typography>
              <Typography variant="h6" color="primary.main">{formatCurrency(data.totals.grandTotal)}</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/sales/${row.id}`)}
        emptyMessage="No sales in this date range."
      />
    </>
  );
};

export default SalesReportTab;
