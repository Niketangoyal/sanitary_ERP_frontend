import { useState, type SyntheticEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Chip, Divider, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageLoader";
import { employeeService } from "@/services/employee.service";
import { formatCurrency, formatDate } from "@/utils/format";
import { EMPLOYMENT_STATUS_LABELS, EMPLOYMENT_STATUS_COLORS, SALARY_TYPE_LABELS } from "@/utils/constants";
import { SalaryHistoryTab } from "./SalaryHistoryTab";
import { IncrementsTab } from "./IncrementsTab";
import { AdvancesTab } from "./AdvancesTab";
import { LeavesTab } from "./LeavesTab";

const TABS = ["salary", "increments", "advances", "leaves"] as const;

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" sx={{ py: 0.75 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Stack>
);

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>("salary");

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employees", id],
    queryFn: () => employeeService.getById(id as string),
    enabled: !!id,
  });

  if (isLoading || !employee) return <PageLoader />;

  const handleTabChange = (_e: SyntheticEvent, value: (typeof TABS)[number]) => setTab(value);

  return (
    <>
      <PageHeader
        title={employee.fullName}
        subtitle={`${employee.employeeCode} · ${employee.designation ?? "No designation set"}`}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/employees")}>
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => navigate(`/employees/${employee.id}/edit`)}
            >
              Edit
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1">Employee Details</Typography>
              <Chip
                size="small"
                label={EMPLOYMENT_STATUS_LABELS[employee.employmentStatus]}
                color={EMPLOYMENT_STATUS_COLORS[employee.employmentStatus]}
              />
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <InfoRow label="Mobile" value={employee.mobile} />
            <InfoRow label="Email" value={employee.email ?? "-"} />
            <InfoRow label="Address" value={employee.address ?? "-"} />
            <InfoRow label="Department" value={employee.department ?? "-"} />
            <InfoRow label="Designation" value={employee.designation ?? "-"} />
            <InfoRow label="Date of Joining" value={formatDate(employee.dateOfJoining)} />
            <InfoRow label="Salary Type" value={SALARY_TYPE_LABELS[employee.salaryType]} />
            <InfoRow label="Current Salary" value={formatCurrency(employee.currentSalary)} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Notes
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {employee.notes || "No notes added."}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 3 } }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2.5, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab value="salary" label="Salary History" />
          <Tab value="increments" label="Increments" />
          <Tab value="advances" label="Advances" />
          <Tab value="leaves" label="Leaves" />
        </Tabs>

        {tab === "salary" && <SalaryHistoryTab employeeId={employee.id} />}
        {tab === "increments" && <IncrementsTab employeeId={employee.id} />}
        {tab === "advances" && <AdvancesTab employeeId={employee.id} />}
        {tab === "leaves" && <LeavesTab employeeId={employee.id} />}
      </Paper>
    </>
  );
};

export default EmployeeDetailPage;
