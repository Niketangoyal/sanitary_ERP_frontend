import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, IconButton, InputAdornment, Stack, TextField, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusChip } from "@/components/StatusChip";
import { useConfirm } from "@/hooks/useConfirm";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { customerService } from "@/services/customer.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatDate } from "@/utils/format";
import type { Customer } from "@/types";

export const CustomersPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, meta, isLoading, filters, setFilters, setPage, setRowsPerPage } = usePaginatedQuery({
    queryKey: "customers",
    fetcher: customerService.list,
  });

  useMemo(() => {
    if (debouncedSearch !== (filters.search ?? "")) {
      setFilters({ search: debouncedSearch || undefined } as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: () => {
      enqueueSnackbar("Customer deleted", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async (customer: Customer) => {
    const ok = await confirm({
      title: "Delete customer",
      message: `Delete "${customer.companyName}"? This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(customer.id);
  };

  const columns = useMemo<ColumnDef<Customer, any>[]>(
    () => [
      { accessorKey: "companyName", header: "Company" },
      { accessorKey: "contactPerson", header: "Contact Person", cell: (c) => c.getValue() ?? "-" },
      { accessorKey: "mobile", header: "Mobile" },
      { accessorKey: "gstNumber", header: "GST No.", cell: (c) => c.getValue() ?? "-" },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: (c) => <StatusChip active={c.getValue() as boolean} />,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (c) => formatDate(c.getValue() as string),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Ledger">
              <IconButton size="small" onClick={() => navigate(`/ledger?customerId=${row.original.id}`)}>
                <MenuBookOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => navigate(`/customers/${row.original.id}/edit`)}>
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
        title="Customers"
        subtitle="Manage wholesale customers and their outstanding balances"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/customers/new")}>
            Add Customer
          </Button>
        }
      />

      <TextField
        placeholder="Search by company, contact, mobile or GST..."
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
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
        emptyMessage="No customers yet. Add your first customer to get started."
      />

      {ConfirmDialog}
    </>
  );
};

export default CustomersPage;
