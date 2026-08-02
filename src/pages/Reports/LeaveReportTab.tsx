import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Button, Chip, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PrintIcon from "@mui/icons-material/PrintOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { EmployeeAutocomplete } from "@/components/EmployeeAutocomplete";
import { useRememberedFilters } from "@/hooks/useRememberedFilters";
import { leaveService } from "@/services/leave.service";
import { pdfService } from "@/services/pdf.service";
import { formatDate } from "@/utils/format";
import { LEAVE_TYPE_LABELS } from "@/utils/constants";
import type { Employee, LeaveRecord } from "@/types";

export const LeaveReportTab = () => {
  const [filters, setFilters] = useRememberedFilters("reports-leave", {
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });
  const [employee, setEmployee] = useState<Employee | null>(null);

  const params = { ...filters, employeeId: employee?.id, limit: 200 };

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "leave", params],
    queryFn: () => leaveService.list(params),
  });

  const rows = data?.data ?? [];
  const totalDays = rows.reduce((sum, r) => sum + Number(r.totalDays), 0);

  const columns = useMemo<ColumnDef<LeaveRecord, any>[]>(
    () => [
      { id: "employee", header: "Employee", cell: ({ row }) => row.original.employee?.fullName ?? "-" },
      {
        accessorKey: "leaveType",
        header: "Type",
        cell: (c) => <Chip size="small" label={LEAVE_TYPE_LABELS[c.getValue() as string]} />,
      },
      { accessorKey: "fromDate", header: "From", cell: (c) => formatDate(c.getValue() as string) },
      { accessorKey: "toDate", header: "To", cell: (c) => formatDate(c.getValue() as string) },
      { accessorKey: "totalDays", header: "Days" },
      { accessorKey: "reason", header: "Reason", cell: (c) => c.getValue() ?? "-" },
    ],
    [],
  );

  const exportParams = { ...filters, employeeId: employee?.id };

  return (
    <>
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

      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mb: 2 }} className="no-print">
        <Button startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print
        </Button>
        <Button startIcon={<DownloadIcon />} onClick={() => pdfService.downloadLeaveReportCsv(exportParams)}>
          Export CSV
        </Button>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => pdfService.downloadLeaveReportPdf(exportParams)}
        >
          Export PDF
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction="row" spacing={4}>
          <Stack>
            <Typography variant="caption" color="text.secondary">
              Records
            </Typography>
            <Typography variant="h6">{rows.length}</Typography>
          </Stack>
          <Stack>
            <Typography variant="caption" color="text.secondary">
              Total Leave Days
            </Typography>
            <Typography variant="h6" color="primary.main">
              {totalDays}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        emptyMessage="No leave records in this range."
      />
    </>
  );
};

export default LeaveReportTab;
