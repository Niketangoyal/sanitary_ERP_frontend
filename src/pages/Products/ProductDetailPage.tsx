import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import dayjs from "dayjs";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageLoader";
import { StatusChip } from "@/components/StatusChip";
import { useConfirm } from "@/hooks/useConfirm";
import { productService } from "@/services/product.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency } from "@/utils/format";
import { ProductFormDialog } from "./ProductFormDialog";
import type { ProductFormValues } from "./ProductFormDialog";
import { useState } from "react";

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
    <Typography color="text.secondary">{label}</Typography>
    <Typography component="div" fontWeight={500}>
      {value}
    </Typography>
  </Stack>
);

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const [editOpen, setEditOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["products", id],
    queryFn: () => productService.getById(id as string),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (values: ProductFormValues) => productService.update(id as string, values),
    onSuccess: () => {
      enqueueSnackbar("Product updated", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => productService.remove(id as string),
    onSuccess: () => {
      enqueueSnackbar("Product deleted", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products");
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate();
  };

  if (isLoading || !product) return <PageLoader />;

  const isDeleted = !!product.deletedAt;

  return (
    <>
      <PageHeader
        title={product.itemName}
        subtitle={product.brand ?? undefined}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/products")}>
              Back
            </Button>
            {!isDeleted && (
              <>
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
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
          This product was deleted on {dayjs(product.deletedAt).format("DD MMM YYYY, h:mm A")}
          {product.deletionReason ? ` — ${product.deletionReason}` : ""}.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Category" value={product.category ?? "-"} />
            <InfoRow label="Specification" value={product.specification ?? "-"} />
            <InfoRow label="Unit" value={product.unit} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Reference Purchase Price" value={formatCurrency(product.purchasePrice)} />
            <InfoRow label="Selling Price" value={formatCurrency(product.sellingPrice)} />
            <InfoRow label="GST %" value={`${product.gstPercent}%`} />
            <InfoRow label="Status" value={<StatusChip active={product.status === "ACTIVE"} />} />
          </Grid>
        </Grid>
      </Paper>

      <ProductFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={(values) => updateMutation.mutate(values)}
        initialData={product}
        isSubmitting={updateMutation.isPending}
      />

      {ConfirmDialog}
    </>
  );
};

export default ProductDetailPage;
