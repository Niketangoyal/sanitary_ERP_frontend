import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { MenuItem, Paper, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { ReportToolbar } from "@/components/ReportToolbar";
import { reportService } from "@/services/report.service";
import { pdfService } from "@/services/pdf.service";
import { formatCurrency } from "@/utils/format";
import type { MonthlySalesRow } from "@/services/report.service";

const currentYear = dayjs().year();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export const MonthlySalesReportTab = () => {
  const [year, setYear] = useState(currentYear);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "monthly-sales", year],
    queryFn: () => reportService.monthlySales(year),
  });

  const columns = useMemo<ColumnDef<MonthlySalesRow, any>[]>(
    () => [
      { accessorKey: "label", header: "Month" },
      { accessorKey: "count", header: "Invoices" },
      { accessorKey: "total", header: "Total Sales", cell: (c) => formatCurrency(c.getValue() as number) },
    ],
    [],
  );

  return (
    <>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }} className="no-print">
        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField select label="Year" fullWidth size="small" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <ReportToolbar onExportPdf={() => pdfService.downloadReport("monthly-sales", { year: String(year) }, "Monthly-Sales-Report.pdf")} />

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2.5, height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data ?? []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="total" fill="#145C9E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} emptyMessage="No sales data for this year." />
    </>
  );
};

export default MonthlySalesReportTab;
