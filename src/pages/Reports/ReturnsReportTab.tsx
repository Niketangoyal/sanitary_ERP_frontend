import { useMemo, useState } from "react";
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
import type { Customer, ReturnDoc } from "@/types";

export const ReturnsReportTab = () => {
  const [filters, setFilters] = useRememberedFilters("reports-returns", {
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });
  const [customer, setCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "returns", filters.from, filters.to, customer?.id],
    queryFn: () => reportService.returns({ ...filters, customerId: customer?.id }),
  });

  const columns = useMemo<ColumnDef<ReturnDoc, any>[]>(
    () => [
      { accessorKey: "returnNumber", header: "Return #" },
      { accessorKey: "returnDate", header: "Date", cell: (c) => formatDate(c.getValue() as string) },
      { id: "customer", header: "Customer", cell: ({ row }) => row.original.customer?.companyName ?? "-" },
      { accessorKey: "reason", header: "Reason", cell: (c) => c.getValue() ?? "-" },
      { accessorKey: "gstTotal", header: "GST", cell: (c) => formatCurrency(c.getValue() as string) },
      { accessorKey: "grandTotal", header: "Amount", cell: (c) => formatCurrency(c.getValue() as string) },
    ],
    [],
  );

  return (
    <>
      <DateRangeFilter from={filters.from} to={filters.to} onChange={setFilters} customer={customer} onCustomerChange={setCustomer} />
      <ReportToolbar onExportPdf={() => pdfService.downloadReport("returns", { ...filters, customerId: customer?.id }, "Returns-Report.pdf")} />

      {data && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
          <Stack direction="row" spacing={4}>
            <Stack>
              <Typography variant="caption" color="text.secondary">Returns</Typography>
              <Typography variant="h6">{data.count}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">Total Amount</Typography>
              <Typography variant="h6" color="primary.main">{formatCurrency(data.totals.grandTotal)}</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      <DataTable columns={columns} data={data?.rows ?? []} isLoading={isLoading} emptyMessage="No returns in this date range." />
    </>
  );
};

export default ReturnsReportTab;
