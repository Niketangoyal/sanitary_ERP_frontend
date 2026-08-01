import { useMemo } from "react";
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
import { formatCurrency, formatNumber } from "@/utils/format";
import type { ItemWiseSalesRow } from "@/services/report.service";

export const ItemWiseSalesReportTab = () => {
  const [filters, setFilters] = useRememberedFilters("reports-item-wise", {
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "item-wise-sales", filters.from, filters.to],
    queryFn: () => reportService.itemWiseSales(filters),
  });

  const columns = useMemo<ColumnDef<ItemWiseSalesRow, any>[]>(
    () => [
      { accessorKey: "itemName", header: "Item Name" },
      { accessorKey: "brand", header: "Brand", cell: (c) => c.getValue() ?? "-" },
      {
        accessorKey: "category",
        header: "Category",
        cell: (c) => (c.getValue() ? <Chip size="small" label={c.getValue() as string} /> : "-"),
      },
      {
        accessorKey: "quantitySold",
        header: "Qty Sold",
        cell: (c) => formatNumber(c.getValue() as number),
      },
      {
        accessorKey: "totalGst",
        header: "GST",
        cell: (c) => formatCurrency(c.getValue() as number),
      },
      {
        accessorKey: "totalSales",
        header: "Total Sales",
        cell: (c) => formatCurrency(c.getValue() as number),
      },
    ],
    [],
  );

  return (
    <>
      <DateRangeFilter from={filters.from} to={filters.to} onChange={setFilters} />
      <ReportToolbar onExportPdf={() => pdfService.downloadReport("item-wise-sales", filters, "Item-Wise-Sales-Report.pdf")} />

      {data && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
          <Stack direction="row" spacing={4}>
            <Stack>
              <Typography variant="caption" color="text.secondary">Total Quantity Sold</Typography>
              <Typography variant="h6">{formatNumber(data.totals.quantitySold)}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">Total Sales</Typography>
              <Typography variant="h6" color="primary.main">{formatCurrency(data.totals.totalSales)}</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      <DataTable columns={columns} data={data?.rows ?? []} isLoading={isLoading} emptyMessage="No item sales in this date range." />
    </>
  );
};

export default ItemWiseSalesReportTab;
