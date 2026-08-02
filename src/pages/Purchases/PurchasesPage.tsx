import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, Chip, IconButton, Stack, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { purchaseService } from "@/services/purchase.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency, formatDate, formatNumber } from "@/utils/format";
import type { StockBatch } from "@/types";
import { PurchaseFormDialog } from "./PurchaseFormDialog";
import type { PurchaseFormValues } from "./PurchaseFormDialog";

export const PurchasesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<StockBatch | null>(null);

  const { data, meta, isLoading, setPage, setRowsPerPage } = usePaginatedQuery({
    queryKey: "purchases",
    fetcher: purchaseService.list,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["purchases"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: PurchaseFormValues) =>
      purchaseService.create({ ...values, supplier: values.supplier || undefined }),
    onSuccess: () => {
      enqueueSnackbar("Purchase recorded — stock batch added", { variant: "success" });
      invalidate();
      setFormOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: PurchaseFormValues }) =>
      purchaseService.update(id, { ...values, supplier: values.supplier || undefined }),
    onSuccess: () => {
      enqueueSnackbar("Purchase updated", { variant: "success" });
      invalidate();
      setFormOpen(false);
      setEditingBatch(null);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => purchaseService.remove(id),
    onSuccess: () => {
      enqueueSnackbar("Purchase deleted", { variant: "success" });
      invalidate();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async (batch: StockBatch) => {
    const ok = await confirm({
      title: "Delete Purchase",
      message: `Delete this purchase batch of "${batch.product?.itemName ?? "item"}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(batch.id);
  };

  const handleFormSubmit = (values: PurchaseFormValues) => {
    if (editingBatch) {
      updateMutation.mutate({ id: editingBatch.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = useMemo<ColumnDef<StockBatch, any>[]>(
    () => [
      {
        accessorKey: "purchaseDate",
        header: "Date",
        cell: (c) => formatDate(c.getValue() as string),
      },
      {
        id: "item",
        header: "Item",
        cell: ({ row }) => row.original.product?.itemName ?? "-",
      },
      {
        id: "brand",
        header: "Brand",
        cell: ({ row }) => row.original.product?.brand ?? "-",
      },
      {
        accessorKey: "purchasePrice",
        header: "Purchase Price",
        cell: (c) => formatCurrency(c.getValue() as string),
      },
      {
        accessorKey: "quantity",
        header: "Qty Purchased",
        cell: (c) => formatNumber(c.getValue() as string),
      },
      {
        accessorKey: "quantityRemaining",
        header: "Remaining",
        cell: (c) => {
          const remaining = Number(c.getValue());
          return (
            <Chip
              size="small"
              label={formatNumber(remaining)}
              color={remaining > 0 ? "success" : "default"}
              variant={remaining > 0 ? "filled" : "outlined"}
            />
          );
        },
      },
      { accessorKey: "supplier", header: "Supplier", cell: (c) => c.getValue() ?? "-" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setEditingBatch(row.original);
                  setFormOpen(true);
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => handleDelete(row.original)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <PageHeader
        title="Purchases"
        subtitle="Stock received at cost — every purchase is a separate batch, FIFO-consumed on sale"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingBatch(null);
              setFormOpen(true);
            }}
          >
            Record Purchase
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        emptyMessage="No purchases recorded yet."
      />

      <PurchaseFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingBatch(null);
        }}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        initialData={editingBatch}
      />

      {ConfirmDialog}
    </>
  );
};

export default PurchasesPage;
