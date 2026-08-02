import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  Alert,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import dayjs from "dayjs";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageLoader";
import { useConfirm } from "@/hooks/useConfirm";
import { returnService } from "@/services/return.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency } from "@/utils/format";

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
    <Typography color="text.secondary">{label}</Typography>
    <Typography component="div" fontWeight={500}>
      {value}
    </Typography>
  </Stack>
);

export const ReturnDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();

  const { data: ret, isLoading } = useQuery({
    queryKey: ["returns", id],
    queryFn: () => returnService.getById(id as string),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: (reason?: string) => returnService.delete(id as string, reason),
    onSuccess: () => {
      enqueueSnackbar("Return deleted", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      navigate("/returns");
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete Return",
      message: "Are you sure you want to delete this return? This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(undefined);
  };

  if (isLoading || !ret) return <PageLoader />;

  const isDeleted = !!ret.deletedAt;

  return (
    <>
      <PageHeader
        title={`Return ${ret.returnNumber}`}
        subtitle={ret.sale ? `Against invoice ${ret.sale.invoiceNumber}` : undefined}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/returns")}>
              Back
            </Button>
            {!isDeleted && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/returns/${ret.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </>
            )}
          </Stack>
        }
      />

      {isDeleted && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          This return was deleted on {dayjs(ret.deletedAt).format("DD MMM YYYY, h:mm A")}
          {ret.deletionReason ? ` — ${ret.deletionReason}` : ""}. Its inventory and ledger effects have been
          reversed.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Customer" value={ret.customer?.companyName ?? "-"} />
            <InfoRow label="Return Date" value={dayjs(ret.returnDate).format("DD MMM YYYY")} />
            <InfoRow label="Against Invoice" value={ret.sale?.invoiceNumber ?? "-"} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Reason" value={ret.reason ?? "-"} />
            <InfoRow label="Processed By" value={ret.processedBy?.name ?? "-"} />
            <InfoRow
              label="Status"
              value={isDeleted ? <Chip size="small" label="Deleted" color="error" /> : <Chip size="small" label="Active" color="success" />}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Items
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">GST %</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(ret.items ?? []).map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.itemName}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{formatCurrency(item.rate)}</TableCell>
                <TableCell align="right">{item.gstPercent}%</TableCell>
                <TableCell align="right">{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Stack alignItems="flex-end" sx={{ mt: 2 }} spacing={0.5}>
          <Stack direction="row" spacing={4}>
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>{formatCurrency(ret.subtotal)}</Typography>
          </Stack>
          <Stack direction="row" spacing={4}>
            <Typography color="text.secondary">GST</Typography>
            <Typography>{formatCurrency(ret.gstTotal)}</Typography>
          </Stack>
          <Stack direction="row" spacing={4}>
            <Typography variant="subtitle1">Grand Total</Typography>
            <Typography variant="subtitle1" color="primary.main">
              {formatCurrency(ret.grandTotal)}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {ConfirmDialog}
    </>
  );
};

export default ReturnDetailPage;
