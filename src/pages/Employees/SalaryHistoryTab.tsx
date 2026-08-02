import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { salaryService } from "@/services/salary.service";
import { pdfService } from "@/services/pdf.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency } from "@/utils/format";
import { MONTH_LABELS, SALARY_PAYMENT_STATUS_LABELS, SALARY_PAYMENT_STATUS_COLORS } from "@/utils/constants";
import type { SalaryRecord } from "@/types";
import { GenerateSalaryDialog } from "./GenerateSalaryDialog";
import type { GenerateSalaryFormValues } from "./GenerateSalaryDialog";
import { PaySalaryDialog } from "./PaySalaryDialog";
import type { PaySalaryFormValues } from "./PaySalaryDialog";
import { SalaryDetailDialog } from "./SalaryDetailDialog";

export const SalaryHistoryTab = ({ employeeId }: { employeeId: string }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<SalaryRecord | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["salary-records", "employee", employeeId],
    queryFn: () => salaryService.listForEmployee(employeeId),
  });

  const generateMutation = useMutation({
    mutationFn: (values: GenerateSalaryFormValues) => salaryService.generate(employeeId, values),
    onSuccess: (record) => {
      enqueueSnackbar(`Salary generated: ${record.salaryNumber}`, { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["salary-records"] });
      queryClient.invalidateQueries({ queryKey: ["advances"] });
      setGenerateOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const payMutation = useMutation({
    mutationFn: (values: PaySalaryFormValues) => salaryService.pay(payTarget!.id, values),
    onSuccess: () => {
      enqueueSnackbar("Salary payment recorded", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["salary-records"] });
      setPayTarget(null);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const columns = useMemo<ColumnDef<SalaryRecord, any>[]>(
    () => [
      {
        id: "period",
        header: "Period",
        cell: ({ row }) => `${MONTH_LABELS[row.original.month - 1]} ${row.original.year}`,
      },
      { accessorKey: "salaryNumber", header: "Slip #" },
      { accessorKey: "grossSalary", header: "Gross", cell: (c) => formatCurrency(c.getValue() as string) },
      {
        id: "deductions",
        header: "Deductions",
        cell: ({ row }) =>
          formatCurrency(Number(row.original.leaveDeduction) + Number(row.original.advanceDeduction)),
      },
      { accessorKey: "netPay", header: "Net Pay", cell: (c) => formatCurrency(c.getValue() as string) },
      { accessorKey: "amountPaid", header: "Paid", cell: (c) => formatCurrency(c.getValue() as string) },
      { accessorKey: "balanceDue", header: "Balance", cell: (c) => formatCurrency(c.getValue() as string) },
      {
        accessorKey: "paymentStatus",
        header: "Status",
        cell: (c) => (
          <Chip
            size="small"
            label={SALARY_PAYMENT_STATUS_LABELS[c.getValue() as string]}
            color={SALARY_PAYMENT_STATUS_COLORS[c.getValue() as string]}
          />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => setDetailId(row.original.id)}>
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {Number(row.original.balanceDue) > 0 && (
              <Tooltip title="Pay">
                <IconButton size="small" onClick={() => setPayTarget(row.original)}>
                  <PaymentsOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Download Slip">
              <IconButton
                size="small"
                onClick={() => pdfService.downloadSalarySlip(row.original.id, row.original.salaryNumber)}
              >
                <PictureAsPdfOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Salary History</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={() => setGenerateOpen(true)}>
          Generate Salary
        </Button>
      </Stack>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="No salary generated yet." />

      <GenerateSalaryDialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSubmit={(values) => generateMutation.mutate(values)}
        isSubmitting={generateMutation.isPending}
        employeeId={employeeId}
      />
      <PaySalaryDialog
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        onSubmit={(values) => payMutation.mutate(values)}
        isSubmitting={payMutation.isPending}
        record={payTarget}
      />
      <SalaryDetailDialog open={!!detailId} onClose={() => setDetailId(null)} salaryRecordId={detailId} />
    </>
  );
};

export default SalaryHistoryTab;
