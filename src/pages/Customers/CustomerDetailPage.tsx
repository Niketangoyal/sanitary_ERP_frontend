import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageLoader";
import { StatCard } from "@/components/StatCard";
import { StatusChip } from "@/components/StatusChip";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import { customerService } from "@/services/customer.service";
import { formatCurrency, formatDate } from "@/utils/format";

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" sx={{ py: 0.75 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Stack>
);

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["customers", id],
    queryFn: () => customerService.getById(id as string),
    enabled: !!id,
  });

  if (isLoading || !data) return <PageLoader />;

  const { customer, cashBalance, billBalance, totalOutstanding } = data;

  return (
    <>
      <PageHeader
        title={customer.companyName}
        subtitle="Customer details and outstanding summary"
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/customers")}>
              Back
            </Button>
            <Button
              variant="outlined"
              startIcon={<MenuBookOutlinedIcon />}
              onClick={() => navigate(`/ledger?customerId=${customer.id}`)}
            >
              View Ledger
            </Button>
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => navigate(`/customers/${customer.id}/edit`)}
            >
              Edit
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Cash Account Balance"
            value={formatCurrency(cashBalance)}
            icon={AccountBalanceWalletOutlinedIcon}
            color={cashBalance > 0 ? "warning" : "success"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Bill Account Balance"
            value={formatCurrency(billBalance)}
            icon={ReceiptLongOutlinedIcon}
            color={billBalance > 0 ? "warning" : "success"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Total Outstanding"
            value={formatCurrency(totalOutstanding)}
            icon={PaidOutlinedIcon}
            color={totalOutstanding > 0 ? "error" : "success"}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1">Company Details</Typography>
              <StatusChip active={customer.isActive} />
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <InfoRow label="Contact Person" value={customer.contactPerson ?? "-"} />
            <InfoRow label="Mobile" value={customer.mobile} />
            <InfoRow label="GST Number" value={customer.gstNumber ?? "-"} />
            <InfoRow label="Address" value={customer.address ?? "-"} />
            <InfoRow label="Customer Since" value={formatDate(customer.createdAt)} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Notes
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {customer.notes || "No notes added."}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Chip label={`Opening Cash: ${formatCurrency(customer.openingCashBalance)}`} size="small" />
              <Chip label={`Opening Bill: ${formatCurrency(customer.openingBillBalance)}`} size="small" />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default CustomerDetailPage;
