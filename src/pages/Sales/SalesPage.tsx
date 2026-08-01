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
import { saleService } from "@/services/sale.service";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Sale } from "@/types";

export const SalesPage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, meta, isLoading, filters, setFilters, setPage, setRowsPerPage } = usePaginatedQuery({
    queryKey: "sales",
    fetcher: saleService.list,
  });

  useMemo(() => {
    if (debouncedSearch !== (filters.search ?? "")) {
      setFilters({ search: debouncedSearch || undefined } as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const columns = useMemo<ColumnDef<Sale, any>[]>(
    () => [
      { accessorKey: "invoiceNumber", header: "Invoice #" },
      {
        accessorKey: "invoiceDate",
        header: "Date",
        cell: (c) => formatDate(c.getValue() as string),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => row.original.customer?.companyName ?? "-",
      },
      {
        accessorKey: "grandTotal",
        header: "Grand Total",
        cell: (c) => formatCurrency(c.getValue() as string),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Sales"
        subtitle="All sale invoices"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/sales/new")}>
            Create Invoice
          </Button>
        }
      />

      <TextField
        placeholder="Search by invoice number..."
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
        onRowClick={(row) => navigate(`/sales/${row.id}`)}
        emptyMessage="No sales yet. Create your first invoice."
      />
    </>
  );
};

export default SalesPage;
