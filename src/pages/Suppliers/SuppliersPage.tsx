import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, IconButton, InputAdornment, Stack, TextField, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusChip } from "@/components/StatusChip";
import { useConfirm } from "@/hooks/useConfirm";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { supplierService } from "@/services/supplier.service";
import { getErrorMessage } from "@/api/axiosClient";
import type { Supplier } from "@/types";
import { SupplierFormDialog } from "./SupplierFormDialog";
import type { SupplierFormValues } from "./SupplierFormDialog";

export const SuppliersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data, meta, isLoading, filters, setFilters, setPage, setRowsPerPage } = usePaginatedQuery({
    queryKey: "suppliers",
    fetcher: supplierService.list,
  });

  useMemo(() => {
    if (debouncedSearch !== (filters.search ?? "")) {
      setFilters({ search: debouncedSearch || undefined } as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const createMutation = useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => {
      enqueueSnackbar("Supplier added", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setFormOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: SupplierFormValues }) =>
      supplierService.update(id, values),
    onSuccess: () => {
      enqueueSnackbar("Supplier updated", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setFormOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supplierService.remove(id),
    onSuccess: () => {
      enqueueSnackbar("Supplier deleted", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async (supplier: Supplier) => {
    const ok = await confirm({
      title: "Delete supplier",
      message: `Delete "${supplier.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(supplier.id);
  };

  const handleFormSubmit = (values: SupplierFormValues) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = useMemo<ColumnDef<Supplier, any>[]>(
    () => [
      { accessorKey: "name", header: "Supplier Name" },
      { accessorKey: "contactPerson", header: "Contact Person", cell: (c) => c.getValue() ?? "-" },
      { accessorKey: "mobile", header: "Mobile", cell: (c) => c.getValue() ?? "-" },
      { accessorKey: "gstNumber", header: "GST No.", cell: (c) => c.getValue() ?? "-" },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: (c) => <StatusChip active={c.getValue() as boolean} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setEditingSupplier(row.original);
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
        title="Suppliers"
        subtitle="Manage vendors that goods are purchased from"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingSupplier(null);
              setFormOpen(true);
            }}
          >
            Add Supplier
          </Button>
        }
      />

      <TextField
        placeholder="Search by name, contact, mobile or GST..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        sx={{ mb: 2, maxWidth: 420 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <DataTable
        columns={columns}
        data={data}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        emptyMessage="No suppliers yet. Add your first supplier to get started."
      />

      <SupplierFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSupplier}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {ConfirmDialog}
    </>
  );
};

export default SuppliersPage;
