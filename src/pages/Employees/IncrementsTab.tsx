import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { salaryIncrementService } from "@/services/salaryIncrement.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency, formatDate } from "@/utils/format";
import type { SalaryIncrement } from "@/types";
import { AddIncrementDialog } from "./AddIncrementDialog";
import type { IncrementFormValues } from "./AddIncrementDialog";

export const IncrementsTab = ({ employeeId }: { employeeId: string }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ["salary-increments", employeeId],
    queryFn: () => salaryIncrementService.list(employeeId),
  });

  const mutation = useMutation({
    mutationFn: (values: IncrementFormValues) =>
      salaryIncrementService.create(employeeId, { ...values, reason: values.reason || undefined }),
    onSuccess: () => {
      enqueueSnackbar("Salary increment recorded", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["salary-increments", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employees", employeeId] });
      setOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const columns = useMemo<ColumnDef<SalaryIncrement, any>[]>(
    () => [
      { accessorKey: "effectiveDate", header: "Effective Date", cell: (c) => formatDate(c.getValue() as string) },
      { accessorKey: "previousSalary", header: "Previous Salary", cell: (c) => formatCurrency(c.getValue() as string) },
      { accessorKey: "newSalary", header: "New Salary", cell: (c) => formatCurrency(c.getValue() as string) },
      { accessorKey: "reason", header: "Reason", cell: (c) => c.getValue() ?? "-" },
    ],
    [],
  );

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Salary Increment History</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Increment
        </Button>
      </Stack>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="No increments recorded yet." />

      <AddIncrementDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(values) => mutation.mutate(values)}
        isSubmitting={mutation.isPending}
      />
    </>
  );
};

export default IncrementsTab;
