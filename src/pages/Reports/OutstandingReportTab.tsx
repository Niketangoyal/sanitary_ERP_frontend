import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Paper, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { ReportToolbar } from "@/components/ReportToolbar";
import { reportService } from "@/services/report.service";
import { pdfService } from "@/services/pdf.service";
import { formatCurrency } from "@/utils/format";
import type { OutstandingCustomerRow } from "@/types";

export const OutstandingReportTab = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "outstanding"],
    queryFn: reportService.outstanding,
  });

  const columns = useMemo<ColumnDef<OutstandingCustomerRow, any>[]>(
    () => [
      { accessorKey: "companyName", header: "Customer" },
      { accessorKey: "mobile", header: "Mobile" },
      {
        accessorKey: "cashBalance",
        header: "Cash Balance",
        cell: (c) => formatCurrency(c.getValue() as number),
      },
      {
        accessorKey: "billBalance",
        header: "Bill Balance",
        cell: (c) => formatCurrency(c.getValue() as number),
      },
      {
        accessorKey: "totalOutstanding",
        header: "Total Outstanding",
        cell: (c) => formatCurrency(c.getValue() as number),
      },
    ],
    [],
  );

  return (
    <>
      <ReportToolbar onExportPdf={() => pdfService.downloadReport("outstanding", {}, "Outstanding-Report.pdf")} />

      {data && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
          <Stack direction="row" spacing={4}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Total Cash Outstanding
              </Typography>
              <Typography variant="h6">{formatCurrency(data.totals.cashBalance)}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Total Bill Outstanding
              </Typography>
              <Typography variant="h6">{formatCurrency(data.totals.billBalance)}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Grand Total Outstanding
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(data.totals.totalOutstanding)}
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/ledger?customerId=${row.customerId}`)}
        emptyMessage="No outstanding balances. All customers are settled."
      />
    </>
  );
};

export default OutstandingReportTab;
