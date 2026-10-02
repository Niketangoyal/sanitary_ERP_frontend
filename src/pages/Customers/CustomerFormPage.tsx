import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SaveIcon from "@mui/icons-material/Save";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageLoader";
import { customerService } from "@/services/customer.service";
import { getErrorMessage } from "@/api/axiosClient";

const customerSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().optional(),
  mobile: z.string().min(10, "Enter a valid mobile number"),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  openingCashBalance: z.coerce.number().default(0),
  openingBillBalance: z.coerce.number().default(0),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export const CustomerFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ["customers", id],
    queryFn: () => customerService.getById(id as string),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      mobile: "",
      address: "",
      gstNumber: "",
      openingCashBalance: 0,
      openingBillBalance: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        companyName: existing.customer.companyName,
        contactPerson: existing.customer.contactPerson ?? "",
        mobile: existing.customer.mobile,
        address: existing.customer.address ?? "",
        gstNumber: existing.customer.gstNumber ?? "",
        openingCashBalance: Number(existing.customer.openingCashBalance),
        openingBillBalance: Number(existing.customer.openingBillBalance),
        notes: existing.customer.notes ?? "",
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (values: CustomerFormValues) =>
      isEdit ? customerService.update(id as string, values) : customerService.create(values),
    onSuccess: () => {
      enqueueSnackbar(isEdit ? "Customer updated" : "Customer created", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate("/customers");
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: "error" }),
  });

  if (isEdit && isLoading) return <PageLoader />;

  return (
    <>
      <PageHeader title={isEdit ? "Edit Customer" : "Add Customer"} />
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, maxWidth: 820 }}>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Company Name"
                fullWidth
                required
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
                {...register("companyName")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Contact Person" fullWidth {...register("contactPerson")} />
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
              <TextField label="GST Number" fullWidth {...register("gstNumber")} />
            </Grid>
            <Grid size={12}>
              <TextField label="Address" fullWidth multiline minRows={2} {...register("address")} />
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Opening Balances{isEdit ? " (locked after creation)" : ""}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="openingCashBalance"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Cash Balance"
                    type="number"
                    fullWidth
                    disabled={isEdit}
                    slotProps={{ htmlInput: { step: "0.01" } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="openingBillBalance"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Bill Balance"
                    type="number"
                    fullWidth
                    disabled={isEdit}
                    slotProps={{ htmlInput: { step: "0.01" } }}
                  />
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
                <Button onClick={() => navigate("/customers")} disabled={mutation.isPending}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={mutation.isPending}
                >
                  {isEdit ? "Save Changes" : "Create Customer"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
};

export default CustomerFormPage;
