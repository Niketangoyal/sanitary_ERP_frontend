import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, InputAdornment, MenuItem, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PaymentStatusChip, SaleTypeChip } from "@/components/StatusChip";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { saleService } from "@/services/sale.service";
import { formatCurrency, formatDate } from "@/utils/format";
import { SALE_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/utils/constants";
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
        accessorKey: "saleType",
        header: "Type",
        cell: (c) => <SaleTypeChip saleType={c.getValue() as Sale["saleType"]} />,
      },
      {
        accessorKey: "grandTotal",
        header: "Grand Total",
        cell: (c) => formatCurrency(c.getValue() as string),
      },
      {
        accessorKey: "balanceDue",
        header: "Balance Due",
        cell: (c) => formatCurrency(c.getValue() as string),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: (c) => <PaymentStatusChip status={c.getValue() as Sale["paymentStatus"]} />,
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

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by invoice number..."
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
          label="Sale Type"
          value={filters.saleType ?? ""}
          onChange={(e) => setFilters({ saleType: e.target.value || undefined } as never)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Types</MenuItem>
          {Object.entries(SALE_TYPE_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Payment Status"
          value={filters.paymentStatus ?? ""}
          onChange={(e) => setFilters({ paymentStatus: e.target.value || undefined } as never)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
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
        onRowClick={(row) => navigate(`/sales/${row.id}`)}
        emptyMessage="No sales yet. Create your first invoice."
      />
    </>
  );
};

export default SalesPage;
