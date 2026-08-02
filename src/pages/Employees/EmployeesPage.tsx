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
import { employeeService } from "@/services/employee.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency, formatDate } from "@/utils/format";
import { EMPLOYMENT_STATUS_LABELS, EMPLOYMENT_STATUS_COLORS, SALARY_TYPE_LABELS } from "@/utils/constants";
import type { Employee } from "@/types";

export const EmployeesPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, meta, isLoading, filters, setFilters, setPage, setRowsPerPage } = usePaginatedQuery({
    queryKey: "employees",
    fetcher: employeeService.list,
  });

  useMemo(() => {
    if (debouncedSearch !== (filters.search ?? "")) {
      setFilters({ search: debouncedSearch || undefined } as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeService.remove(id),
    onSuccess: () => {
      enqueueSnackbar("Employee deleted", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async (employee: Employee) => {
    const ok = await confirm({
      title: "Delete employee",
      message: `Delete "${employee.fullName}"? This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(employee.id);
  };

  const columns = useMemo<ColumnDef<Employee, any>[]>(
    () => [
      { accessorKey: "employeeCode", header: "Code" },
      { accessorKey: "fullName", header: "Name" },
      { accessorKey: "mobile", header: "Mobile" },
      { accessorKey: "department", header: "Department", cell: (c) => c.getValue() ?? "-" },
      { accessorKey: "designation", header: "Designation", cell: (c) => c.getValue() ?? "-" },
      {
        accessorKey: "salaryType",
        header: "Salary Type",
        cell: (c) => SALARY_TYPE_LABELS[c.getValue() as string],
      },
      {
        accessorKey: "currentSalary",
        header: "Current Salary",
        cell: (c) => formatCurrency(c.getValue() as string),
      },
      { accessorKey: "dateOfJoining", header: "Joined", cell: (c) => formatDate(c.getValue() as string) },
      {
        accessorKey: "employmentStatus",
        header: "Status",
        cell: (c) => (
          <Chip
            size="small"
            label={EMPLOYMENT_STATUS_LABELS[c.getValue() as string]}
            color={EMPLOYMENT_STATUS_COLORS[c.getValue() as string]}
          />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => navigate(`/employees/${row.original.id}/edit`)}>
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
        title="Employees"
        subtitle="Manage staff, salaries, advances and leave"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/employees/new")}>
            Add Employee
          </Button>
        }
      />

      <TextField
        placeholder="Search by name, mobile or employee code..."
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
        onRowClick={(row) => navigate(`/employees/${row.id}`)}
        emptyMessage="No employees yet. Add your first employee to get started."
      />

      {ConfirmDialog}
    </>
  );
};

export default EmployeesPage;
