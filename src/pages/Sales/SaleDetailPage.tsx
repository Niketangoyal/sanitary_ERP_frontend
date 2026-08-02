import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Alert, Button, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/PrintOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdfOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import dayjs from "dayjs";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageLoader";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { useConfirm } from "@/hooks/useConfirm";
import { saleService } from "@/services/sale.service";
import { settingsService } from "@/services/settings.service";
import { pdfService } from "@/services/pdf.service";
import { getErrorMessage } from "@/api/axiosClient";

export const SaleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();

  const { data: sale, isLoading: saleLoading } = useQuery({
    queryKey: ["sales", id],
    queryFn: () => saleService.getById(id as string),
    enabled: !!id,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsService.get,
  });

  const deleteMutation = useMutation({
    mutationFn: (reason?: string) => saleService.remove(id as string, reason),
    onSuccess: () => {
      enqueueSnackbar("Invoice deleted", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      navigate("/sales");
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete Invoice",
      message: "Are you sure you want to delete this invoice? This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(undefined);
  };

  if (saleLoading || settingsLoading || !sale || !settings) return <PageLoader />;

  const isDeleted = !!sale.deletedAt;

  return (
    <>
      <PageHeader
        title={`Invoice ${sale.invoiceNumber}`}
        actions={
          <Stack direction="row" spacing={1.5} className="no-print">
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/sales")}>
              Back
            </Button>
            {!isDeleted && (
              <>
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
                  Print
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => pdfService.downloadSaleInvoice(sale.id, sale.invoiceNumber)}
                >
                  Export PDF
                </Button>
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/sales/${sale.id}/edit`)}>
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
        <Alert severity="error" sx={{ mb: 2.5 }} className="no-print">
          This invoice was deleted on {dayjs(sale.deletedAt).format("DD MMM YYYY, h:mm A")}
          {sale.deletionReason ? ` — ${sale.deletionReason}` : ""}. Its inventory and ledger effects have been
          reversed.
        </Alert>
      )}

      <InvoiceDocument sale={sale} settings={settings} />

      {ConfirmDialog}
    </>
  );
};

export default SaleDetailPage;
