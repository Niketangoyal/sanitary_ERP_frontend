import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  Button,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
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
import { productService } from "@/services/product.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency } from "@/utils/format";
import type { Product } from "@/types";
import { ProductFormDialog } from "./ProductFormDialog";
import type { ProductFormValues } from "./ProductFormDialog";

export const ProductsPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["products", "categories"],
    queryFn: productService.categories,
  });

  const { data, meta, isLoading, filters, setFilters, setPage, setRowsPerPage } = usePaginatedQuery({
    queryKey: "products",
    fetcher: productService.list,
  });

  useMemo(() => {
    if (debouncedSearch !== (filters.search ?? "")) {
      setFilters({ search: debouncedSearch || undefined } as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      enqueueSnackbar("Product added", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setFormOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProductFormValues }) =>
      productService.update(id, values),
    onSuccess: () => {
      enqueueSnackbar("Product updated", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setFormOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: productService.remove,
    onSuccess: () => {
      enqueueSnackbar("Product deleted", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async (product: Product) => {
    const ok = await confirm({
      title: "Delete product",
      message: `Delete "${product.itemName}"? This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(product.id);
  };

  const handleFormSubmit = (values: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      { accessorKey: "itemName", header: "Item Name" },
      { accessorKey: "brand", header: "Brand", cell: (c) => c.getValue() ?? "-" },
      {
        accessorKey: "category",
        header: "Category",
        cell: (c) => (c.getValue() ? <Chip size="small" label={c.getValue() as string} /> : "-"),
      },
      { accessorKey: "unit", header: "Unit" },
      {
        accessorKey: "sellingPrice",
        header: "Selling Price",
        cell: (c) => formatCurrency(c.getValue() as string),
      },
      {
        accessorKey: "gstPercent",
        header: "GST %",
        cell: (c) => `${c.getValue()}%`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (c) => <StatusChip active={c.getValue() === "ACTIVE"} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setEditingProduct(row.original);
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
        title="Products"
        subtitle="Manage sanitary & bathroom fittings catalog"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingProduct(null);
              setFormOpen(true);
            }}
          >
            Add Product
          </Button>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by item, brand or spec..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ maxWidth: 360, flex: 1 }}
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
        <TextField
          select
          label="Category"
          value={filters.category ?? ""}
          onChange={(e) => setFilters({ category: e.target.value || undefined } as never)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <DataTable
        columns={columns}
        data={data}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => navigate(`/products/${row.id}`)}
        emptyMessage="No products yet. Add your first product to get started."
      />

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {ConfirmDialog}
    </>
  );
};

export default ProductsPage;
