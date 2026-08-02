import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { advanceService } from "@/services/advance.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatCurrency, formatDate } from "@/utils/format";
import { ADVANCE_STATUS_LABELS, ADVANCE_STATUS_COLORS } from "@/utils/constants";
import type { AdvancePayment } from "@/types";
import { AddAdvanceDialog } from "./AddAdvanceDialog";
import type { AdvanceFormValues } from "./AddAdvanceDialog";

export const AdvancesTab = ({ employeeId }: { employeeId: string }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<AdvancePayment | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["advances", employeeId],
    queryFn: () => advanceService.list(employeeId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["advances", employeeId] });
    queryClient.invalidateQueries({ queryKey: ["salary-records"] });
  };

  const createMutation = useMutation({
    mutationFn: (values: AdvanceFormValues) =>
      advanceService.create(employeeId, { ...values, reason: values.reason || undefined }),
    onSuccess: () => {
      enqueueSnackbar("Advance recorded", { variant: "success" });
      invalidate();
      setOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: (values: AdvanceFormValues) =>
      advanceService.update(employeeId, editingAdvance!.id, { ...values, reason: values.reason || undefined }),
    onSuccess: () => {
      enqueueSnackbar("Advance updated", { variant: "success" });
      invalidate();
      setOpen(false);
      setEditingAdvance(null);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => advanceService.remove(employeeId, id),
    onSuccess: () => {
      enqueueSnackbar("Advance deleted", { variant: "success" });
      invalidate();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async (advance: AdvancePayment) => {
    const ok = await confirm({
      title: "Delete Advance",
      message: `Delete advance ${advance.advanceNumber} of ${formatCurrency(advance.amount)}? This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(advance.id);
  };

  const handleFormSubmit = (values: AdvanceFormValues) => {
    if (editingAdvance) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = useMemo<ColumnDef<AdvancePayment, any>[]>(
    () => [
      { accessorKey: "advanceNumber", header: "Advance #" },
      { accessorKey: "date", header: "Date", cell: (c) => formatDate(c.getValue() as string) },
      { accessorKey: "amount", header: "Amount", cell: (c) => formatCurrency(c.getValue() as string) },
      { accessorKey: "adjustedAmount", header: "Adjusted", cell: (c) => formatCurrency(c.getValue() as string) },
      {
        id: "remaining",
        header: "Remaining",
        cell: ({ row }) =>
          formatCurrency(Number(row.original.amount) - Number(row.original.adjustedAmount)),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (c) => (
          <Chip
            size="small"
            label={ADVANCE_STATUS_LABELS[c.getValue() as string]}
            color={ADVANCE_STATUS_COLORS[c.getValue() as string]}
          />
        ),
      },
      { accessorKey: "reason", header: "Reason", cell: (c) => c.getValue() ?? "-" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setEditingAdvance(row.original);
                  setOpen(true);
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={Number(row.original.adjustedAmount) > 0 ? "Already adjusted — cannot delete" : "Delete"}>
              <span>
                <IconButton
                  size="small"
                  disabled={Number(row.original.adjustedAmount) > 0}
                  onClick={() => handleDelete(row.original)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </span>
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Advance Payments</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingAdvance(null);
            setOpen(true);
          }}
        >
          Record Advance
        </Button>
      </Stack>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="No advances recorded yet." />

      <AddAdvanceDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingAdvance(null);
        }}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        initialData={editingAdvance}
      />

      {ConfirmDialog}
    </>
  );
};

export default AdvancesTab;
