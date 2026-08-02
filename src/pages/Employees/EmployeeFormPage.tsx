import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Alert, Button, MenuItem, Paper, Stack, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SaveIcon from "@mui/icons-material/Save";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageLoader";
import { employeeService } from "@/services/employee.service";
import { getErrorMessage } from "@/api/axiosClient";
import { EMPLOYMENT_STATUS_LABELS, SALARY_TYPE_LABELS } from "@/utils/constants";

const employeeSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  mobile: z.string().min(10, "Enter a valid mobile number"),
  address: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  department: z.string().optional(),
  designation: z.string().optional(),
  salaryType: z.enum(["MONTHLY", "DAILY"]),
  currentSalary: z.coerce.number().positive("Starting salary is required"),
  employmentStatus: z.enum(["ACTIVE", "INACTIVE", "LEFT"]),
  notes: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const EmployeeFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ["employees", id],
    queryFn: () => employeeService.getById(id as string),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: "",
      mobile: "",
      address: "",
      email: "",
      dateOfJoining: dayjs().format("YYYY-MM-DD"),
      department: "",
      designation: "",
      salaryType: "MONTHLY",
      currentSalary: 0,
      employmentStatus: "ACTIVE",
      notes: "",
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        fullName: existing.fullName,
        mobile: existing.mobile,
        address: existing.address ?? "",
        email: existing.email ?? "",
        dateOfJoining: dayjs(existing.dateOfJoining).format("YYYY-MM-DD"),
        department: existing.department ?? "",
        designation: existing.designation ?? "",
        salaryType: existing.salaryType,
        currentSalary: Number(existing.currentSalary),
        employmentStatus: existing.employmentStatus,
        notes: existing.notes ?? "",
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (values: EmployeeFormValues) =>
      isEdit ? employeeService.update(id as string, values) : employeeService.create(values),
    onSuccess: (employee) => {
      enqueueSnackbar(isEdit ? "Employee updated" : "Employee added", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      navigate(`/employees/${employee.id}`);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  if (isEdit && isLoading) return <PageLoader />;

  return (
    <>
      <PageHeader title={isEdit ? "Edit Employee" : "Add Employee"} />
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, maxWidth: 900 }}>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full Name"
                fullWidth
                required
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                {...register("fullName")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Mobile Number"
                fullWidth
                required
                error={!!errors.mobile}
                helperText={errors.mobile?.message}
                {...register("mobile")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register("email")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="dateOfJoining"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Date of Joining"
                    value={dayjs(field.value)}
                    disabled={isEdit}
                    onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Address" fullWidth multiline minRows={2} {...register("address")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Department" fullWidth {...register("department")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Designation" fullWidth {...register("designation")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="salaryType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Salary Type" fullWidth>
                    {Object.entries(SALARY_TYPE_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label={isEdit ? "Current Salary (locked)" : "Starting Salary"}
                type="number"
                fullWidth
                required
                disabled={isEdit}
                helperText={isEdit ? "Use Salary Increment to change this" : undefined}
                error={!!errors.currentSalary}
                slotProps={{ htmlInput: { step: "0.01" } }}
                {...register("currentSalary")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="employmentStatus"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Employment Status" fullWidth>
                    {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Notes" fullWidth multiline minRows={2} {...register("notes")} />
            </Grid>

            {mutation.isError && (
              <Grid size={12}>
                <Alert severity="error">{getErrorMessage(mutation.error)}</Alert>
              </Grid>
            )}

            <Grid size={12}>
              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button onClick={() => navigate("/employees")}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={isSubmitting}>
                  {isEdit ? "Save Changes" : "Add Employee"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
};

export default EmployeeFormPage;
