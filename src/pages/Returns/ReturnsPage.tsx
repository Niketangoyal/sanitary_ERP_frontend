import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, InputAdornment, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { returnService } from "@/services/return.service";
import { formatCurrency, formatDate } from "@/utils/format";
import type { ReturnDoc } from "@/types";

export const ReturnsPage = () => {
  const navigate = useNavigate();
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
    ],
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
        emptyMessage="No returns recorded yet."
      />
    </>
  );
};

export default ReturnsPage;
