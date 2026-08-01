import dayjs from "dayjs";
import { Paper, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { CustomerAutocomplete } from "@/components/CustomerAutocomplete";
import type { Customer } from "@/types";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
  customer?: Customer | null;
  onCustomerChange?: (customer: Customer | null) => void;
  extra?: React.ReactNode;
}

export const DateRangeFilter = ({
  from,
  to,
  onChange,
  customer,
  onCustomerChange,
  extra,
}: DateRangeFilterProps) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2.5 }} className="no-print">
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 6, sm: 3 }}>
        <DatePicker
          label="From"
          value={dayjs(from)}
          onChange={(val) => val && onChange({ from: val.format("YYYY-MM-DD"), to })}
          slotProps={{ textField: { fullWidth: true, size: "small" } }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <DatePicker
          label="To"
          value={dayjs(to)}
          onChange={(val) => val && onChange({ from, to: val.format("YYYY-MM-DD") })}
          slotProps={{ textField: { fullWidth: true, size: "small" } }}
        />
      </Grid>
      {onCustomerChange && (
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomerAutocomplete value={customer ?? null} onChange={onCustomerChange} />
        </Grid>
      )}
      {extra && (
        <Grid size={{ xs: 12, sm: "auto" }}>
          <Stack direction="row">{extra}</Stack>
        </Grid>
      )}
    </Grid>
  </Paper>
);
