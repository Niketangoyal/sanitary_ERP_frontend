import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { EmployeeAutocomplete } from "@/components/EmployeeAutocomplete";
import { useRememberedFilters } from "@/hooks/useRememberedFilters";
import { advanceService } from "@/services/advance.service";
import { formatCurrency, formatDate } from "@/utils/format";
import { MONTH_LABELS } from "@/utils/constants";
import type { AdvanceAdjustment, AdvancePendingRow, Employee } from "@/types";

export const AdvanceReportTab = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [filters, setFilters] = useRememberedFilters("reports-advance", {
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });

  const { data: pendingRows = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["advance-reports", "pending"],
    queryFn: advanceService.pendingReport,
  });

  const { data: adjustments = [], isLoading: adjustmentsLoading } = useQuery({
    queryKey: ["advance-reports", "adjustments", employee?.id, filters.from, filters.to],
    queryFn: () => advanceService.adjustmentHistory({ ...filters, employeeId: employee?.id }),
  });

  const pendingColumns = useMemo<ColumnDef<AdvancePendingRow, any>[]>(
    () => [
      { accessorKey: "employeeCode", header: "Code" },
      { accessorKey: "fullName", header: "Employee" },
      { accessorKey: "count", header: "Open Advances" },
      {
        accessorKey: "totalPending",
        header: "Total Pending",
        cell: (c) => formatCurrency(c.getValue() as number),
      },
    ],
    [],
  );

  const adjustmentColumns = useMemo<ColumnDef<AdvanceAdjustment, any>[]>(
    () => [
      { accessorKey: "adjustmentDate", header: "Date", cell: (c) => formatDate(c.getValue() as string) },
      { id: "employee", header: "Employee", cell: ({ row }) => row.original.employee?.fullName ?? "-" },
      {
        id: "period",
        header: "Salary Period",
        cell: ({ row }) =>
          row.original.salaryRecord
            ? `${MONTH_LABELS[row.original.salaryRecord.month - 1]} ${row.original.salaryRecord.year}`
            : "-",
      },
      { id: "advanceNumber", header: "Advance #", cell: ({ row }) => row.original.advance?.advanceNumber ?? "-" },
      { accessorKey: "amount", header: "Adjustment Amount", cell: (c) => formatCurrency(c.getValue() as string) },
      {
        accessorKey: "remainingBalanceAfter",
        header: "Remaining After",
        cell: (c) => formatCurrency(c.getValue() as string),
      },
    ],
    [],
  );

  const totalPending = pendingRows.reduce((sum, r) => sum + r.totalPending, 0);

  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
        Pending Advance Summary
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Total Outstanding Across All Employees
        </Typography>
        <Typography variant="h6" color="error.main">
          {formatCurrency(totalPending)}
        </Typography>
      </Paper>
      <DataTable
        columns={pendingColumns}
        data={pendingRows}
        isLoading={pendingLoading}
        emptyMessage="No pending advances."
      />

      <Typography variant="subtitle1" sx={{ mt: 4, mb: 1.5 }}>
        Advance Adjustment History
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2.5 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <EmployeeAutocomplete value={employee} onChange={setEmployee} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DatePicker
              label="From"
              value={dayjs(filters.from)}
              onChange={(val) => val && setFilters({ ...filters, from: val.format("YYYY-MM-DD") })}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DatePicker
              label="To"
              value={dayjs(filters.to)}
              onChange={(val) => val && setFilters({ ...filters, to: val.format("YYYY-MM-DD") })}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
        </Grid>
      </Paper>
      <DataTable
        columns={adjustmentColumns}
        data={adjustments}
        isLoading={adjustmentsLoading}
        emptyMessage="No advance adjustments in this range."
      />
    </>
  );
};

export default AdvanceReportTab;
