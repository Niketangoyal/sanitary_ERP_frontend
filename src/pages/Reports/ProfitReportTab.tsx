import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { PeriodFilter } from "@/components/PeriodFilter";
import { ReportToolbar } from "@/components/ReportToolbar";
import { StatCard } from "@/components/StatCard";
import { reportService } from "@/services/report.service";
import { pdfService } from "@/services/pdf.service";
import { resolvePeriodRange } from "@/utils/dateRangePresets";
import { formatCurrency, formatNumber } from "@/utils/format";
import type { PeriodPreset } from "@/types";

export const ProfitReportTab = () => {
  const [period, setPeriod] = useState<PeriodPreset>("month");
  const initial = resolvePeriodRange("month");
  const [range, setRange] = useState(initial);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "profit", range.from, range.to],
    queryFn: () => reportService.profit(range),
  });

  const handlePeriodChange = (next: { period: PeriodPreset; from: string; to: string }) => {
    setPeriod(next.period);
    if (next.period === "custom") {
      setRange({ from: next.from, to: next.to });
    } else {
      setRange(resolvePeriodRange(next.period));
    }
  };

  return (
    <>
      <PeriodFilter period={period} from={range.from} to={range.to} onChange={handlePeriodChange} />
      <ReportToolbar
        onExportPdf={() => pdfService.downloadReport("profit", range, "Profit-Report.pdf")}
      />

      {!isLoading && data && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Sales" value={formatCurrency(data.totalSales)} icon={PointOfSaleOutlinedIcon} color="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Purchase Cost (COGS)" value={formatCurrency(data.totalCOGS)} icon={Inventory2OutlinedIcon} color="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Gross Profit" value={formatCurrency(data.grossProfit)} icon={TrendingUpOutlinedIcon} color={data.grossProfit >= 0 ? "success" : "error"} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Profit %" value={`${data.profitPercent}%`} icon={PercentOutlinedIcon} color={data.profitPercent >= 0 ? "success" : "error"} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Invoices" value={String(data.totalInvoices)} icon={ReceiptLongOutlinedIcon} color="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Products Sold" value={formatNumber(data.totalProductsSold)} icon={Inventory2Icon} color="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Cash (Kacha) Sales" value={formatCurrency(data.cashSales)} icon={AccountBalanceWalletOutlinedIcon} color="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Bill (Pakka) Sales" value={formatCurrency(data.billSales)} icon={ReceiptOutlinedIcon} color="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Paid Amount" value={formatCurrency(data.paidAmount)} icon={PaidOutlinedIcon} color="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Outstanding Amount" value={formatCurrency(data.outstandingAmount)} icon={WarningAmberOutlinedIcon} color="error" />
          </Grid>
        </Grid>
      )}

      {!isLoading && data && data.totalInvoices === 0 && (
        <Paper variant="outlined" sx={{ p: 6, borderRadius: 3, textAlign: "center", mt: 2.5 }}>
          No sales in this period.
        </Paper>
      )}
    </>
  );
};

export default ProfitReportTab;
