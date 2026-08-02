import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import dayjs from "dayjs";
import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { PageLoader } from "@/components/PageLoader";
import { PeriodFilter } from "@/components/PeriodFilter";
import { dashboardService } from "@/services/dashboard.service";
import { formatCurrency, formatDate } from "@/utils/format";
import { resolvePeriodRange } from "@/utils/dateRangePresets";
import type { PeriodPreset } from "@/types";

const currentYear = dayjs().year();

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodPreset>("today");
  const [range, setRange] = useState(resolvePeriodRange("today"));

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardService.summary,
  });

  const { data: periodSummary } = useQuery({
    queryKey: ["dashboard", "period-summary", period, range.from, range.to],
    queryFn: () => dashboardService.periodSummary(period, range.from, range.to),
  });

  const handlePeriodChange = (next: { period: PeriodPreset; from: string; to: string }) => {
    setPeriod(next.period);
    setRange(next.period === "custom" ? { from: next.from, to: next.to } : resolvePeriodRange(next.period));
  };

  const { data: monthlySales = [] } = useQuery({
    queryKey: ["dashboard", "monthly-sales", currentYear],
    queryFn: () => dashboardService.monthlySales(currentYear),
  });

  const { data: monthlyCollections = [] } = useQuery({
    queryKey: ["dashboard", "monthly-collections", currentYear],
    queryFn: () => dashboardService.monthlyCollections(currentYear),
  });

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ["dashboard", "recent-transactions"],
    queryFn: () => dashboardService.recentTransactions(8),
  });

  const { data: outstandingCustomers = [] } = useQuery({
    queryKey: ["dashboard", "outstanding-customers"],
    queryFn: () => dashboardService.outstandingCustomers(8),
  });

  if (summaryLoading || !summary) return <PageLoader />;

  const cards = [
    { label: "Total Customers", value: String(summary.totalCustomers), icon: PeopleAltOutlinedIcon, color: "primary" as const },
    { label: "Total Outstanding", value: formatCurrency(summary.totalOutstanding), icon: PaidOutlinedIcon, color: "error" as const },
    { label: "Cash Outstanding", value: formatCurrency(summary.cashOutstanding), icon: AccountBalanceWalletOutlinedIcon, color: "warning" as const },
    { label: "Bill Outstanding", value: formatCurrency(summary.billOutstanding), icon: ReceiptLongOutlinedIcon, color: "warning" as const },
    { label: "Today's Sales", value: formatCurrency(summary.todaySales), icon: PointOfSaleOutlinedIcon, color: "success" as const },
    { label: "Today's Payments", value: formatCurrency(summary.todayPayments), icon: PaymentsOutlinedIcon, color: "success" as const },
    { label: "Today's Returns", value: formatCurrency(summary.todayReturns), icon: AssignmentReturnOutlinedIcon, color: "secondary" as const },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Business overview at a glance" />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
        Period Overview
      </Typography>
      <PeriodFilter period={period} from={range.from} to={range.to} onChange={handlePeriodChange} />

      {periodSummary && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Sales" value={formatCurrency(periodSummary.sales)} icon={PointOfSaleOutlinedIcon} color="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Payments Received" value={formatCurrency(periodSummary.payments)} icon={PaymentsOutlinedIcon} color="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Returns" value={formatCurrency(periodSummary.returns)} icon={AssignmentReturnOutlinedIcon} color="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Cash (Kacha) Sales" value={formatCurrency(periodSummary.cashSales)} icon={AccountBalanceWalletOutlinedIcon} color="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Bill (Pakka) Sales" value={formatCurrency(periodSummary.billSales)} icon={ReceiptLongOutlinedIcon} color="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              label="Gross Profit"
              value={formatCurrency(periodSummary.grossProfit)}
              icon={TrendingUpOutlinedIcon}
              color={periodSummary.grossProfit >= 0 ? "success" : "error"}
              hint={`${periodSummary.profitPercent}% margin`}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: 320 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Monthly Sales ({currentYear})
            </Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={11} tickFormatter={(v: string) => v.split(" ")[0]} />
                <YAxis fontSize={11} />
                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#145C9E" radius={[6, 6, 0, 0]} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: 320 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Monthly Collections ({currentYear})
            </Typography>
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={monthlyCollections}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={11} tickFormatter={(v: string) => v.split(" ")[0]} />
                <YAxis fontSize={11} />
                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#0E9384" strokeWidth={2.5} name="Collections" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Recent Transactions
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                      <TableCell>{tx.customerName}</TableCell>
                      <TableCell>
                        {tx.description}
                        {tx.referenceNumber && (
                          <Chip size="small" label={tx.referenceNumber} sx={{ ml: 1 }} variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ color: tx.amount >= 0 ? "warning.main" : "success.main" }}>
                        {formatCurrency(Math.abs(tx.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No transactions yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Top Outstanding Customers
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Outstanding</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outstandingCustomers.map((c) => (
                    <TableRow
                      key={c.customerId}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/ledger?customerId=${c.customerId}`)}
                    >
                      <TableCell>{c.companyName}</TableCell>
                      <TableCell align="right">{formatCurrency(c.totalOutstanding)}</TableCell>
                    </TableRow>
                  ))}
                  {outstandingCustomers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">All settled up.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardPage;
