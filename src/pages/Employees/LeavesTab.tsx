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
import { leaveService } from "@/services/leave.service";
import { getErrorMessage } from "@/api/axiosClient";
import { formatDate } from "@/utils/format";
import { LEAVE_TYPE_LABELS } from "@/utils/constants";
import type { LeaveRecord } from "@/types";
import { LeaveFormDialog } from "./LeaveFormDialog";
import type { LeaveFormValues } from "./LeaveFormDialog";

export const LeavesTab = ({ employeeId }: { employeeId: string }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveRecord | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["leaves", "employee", employeeId],
    queryFn: () => leaveService.listForEmployee(employeeId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["leaves", "employee", employeeId] });

  const createMutation = useMutation({
    mutationFn: (values: LeaveFormValues) =>
      leaveService.create(employeeId, { ...values, reason: values.reason || undefined }),
    onSuccess: () => {
      enqueueSnackbar("Leave recorded", { variant: "success" });
      invalidate();
      setFormOpen(false);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: (values: LeaveFormValues) =>
      leaveService.update(editing!.id, { ...values, reason: values.reason || undefined }),
    onSuccess: () => {
      enqueueSnackbar("Leave updated", { variant: "success" });
      invalidate();
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leaveService.remove(id),
    onSuccess: () => {
      enqueueSnackbar("Leave deleted", { variant: "success" });
      invalidate();
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  const handleDelete = async (leave: LeaveRecord) => {
    const ok = await confirm({
      title: "Delete leave record",
      message: `Delete this ${LEAVE_TYPE_LABELS[leave.leaveType]} record?`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(leave.id);
  };

  const columns = useMemo<ColumnDef<LeaveRecord, any>[]>(
    () => [
      {
        accessorKey: "leaveType",
        header: "Type",
        cell: (c) => <Chip size="small" label={LEAVE_TYPE_LABELS[c.getValue() as string]} />,
      },
      { accessorKey: "fromDate", header: "From", cell: (c) => formatDate(c.getValue() as string) },
      { accessorKey: "toDate", header: "To", cell: (c) => formatDate(c.getValue() as string) },
      { accessorKey: "totalDays", header: "Days" },
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
                  setEditing(row.original);
                  setFormOpen(true);
                }}
              >
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Leave History</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add Leave
        </Button>
      </Stack>

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyMessage="No leave recorded yet." />

      <LeaveFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => (editing ? updateMutation.mutate(values) : createMutation.mutate(values))}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        initialData={editing}
      />
      {ConfirmDialog}
    </>
  );
};

export default LeavesTab;
