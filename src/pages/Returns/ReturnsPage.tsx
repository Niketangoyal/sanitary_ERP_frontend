import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, Chip, IconButton, InputAdornment, Stack, TextField, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { returnService } from "@/services/return.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency, formatDate } from "@/utils/format";
import type { ReturnDoc } from "@/types";

export const ReturnsPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, meta, isLoading, filters, setFilters, setPage, setRowsPerPage } = usePaginatedQuery({
    queryKey: "returns",
    fetcher: returnService.list,
  });

  useMemo(() => {
    if (debouncedSearch !== (filters.search ?? "")) {
      setFilters({ search: debouncedSearch || undefined } as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => returnService.delete(id),
    onSuccess: () => {
      enqueueSnackbar("Return deleted", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["returns"] });
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async (ret: ReturnDoc) => {
    const ok = await confirm({
      title: "Delete Return",
      message: `Delete return ${ret.returnNumber}? This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(ret.id);
  };

  const columns = useMemo<ColumnDef<ReturnDoc, any>[]>(
    () => [
      { accessorKey: "returnNumber", header: "Return #" },
      {
        accessorKey: "returnDate",
        header: "Date",
        cell: (c) => formatDate(c.getValue() as string),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => row.original.customer?.companyName ?? "-",
      },
      {
        id: "originalInvoice",
        header: "Against Invoice",
        cell: ({ row }) => row.original.sale?.invoiceNumber ?? "-",
      },
      { accessorKey: "reason", header: "Reason", cell: (c) => c.getValue() ?? "-" },
      {
        accessorKey: "grandTotal",
        header: "Amount",
        cell: (c) => formatCurrency(c.getValue() as string),
      },
      {
        id: "processedBy",
        header: "Processed By",
        cell: ({ row }) => row.original.processedBy?.name ?? "-",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.deletedAt ? (
            <Chip size="small" label="Deleted" color="error" />
          ) : (
            <Chip size="small" label="Active" color="success" />
          ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            {!row.original.deletedAt && (
              <>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => navigate(`/returns/${row.original.id}/edit`)}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(row.original)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
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
        title="Returns"
        subtitle="Customer sales returns"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/returns/new")}>
            New Return
          </Button>
        }
      />

      <TextField
        placeholder="Search by return number..."
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
        onRowClick={(row) => navigate(`/returns/${row.id}`)}
        emptyMessage="No returns recorded yet."
      />

      {ConfirmDialog}
    </>
  );
};

export default ReturnsPage;
