import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { ReportToolbar } from "@/components/ReportToolbar";
import { useRememberedFilters } from "@/hooks/useRememberedFilters";
import { reportService } from "@/services/report.service";
import { pdfService } from "@/services/pdf.service";
import { formatCurrency, formatDate } from "@/utils/format";
import type { DateWiseSalesRow } from "@/services/report.service";

export const DateWiseSalesReportTab = () => {
  const [filters, setFilters] = useRememberedFilters("reports-date-wise", {
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "date-wise-sales", filters.from, filters.to],
    queryFn: () => reportService.dateWiseSales(filters),
  });

  const columns = useMemo<ColumnDef<DateWiseSalesRow, any>[]>(
    () => [
      { accessorKey: "date", header: "Date", cell: (c) => formatDate(c.getValue() as string) },
      { accessorKey: "count", header: "Invoices" },
      { accessorKey: "total", header: "Total Sales", cell: (c) => formatCurrency(c.getValue() as number) },
    ],
    [],
  );

  return (
    <>
      <DateRangeFilter from={filters.from} to={filters.to} onChange={setFilters} />
      <ReportToolbar onExportPdf={() => pdfService.downloadReport("date-wise-sales", filters, "Date-Wise-Sales-Report.pdf")} />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} emptyMessage="No sales in this date range." />
    </>
  );
};

export default DateWiseSalesReportTab;
