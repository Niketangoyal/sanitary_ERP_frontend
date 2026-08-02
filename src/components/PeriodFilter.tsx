import { MenuItem, Paper, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { PERIOD_PRESET_LABELS } from "@/utils/constants";
import type { PeriodPreset } from "@/types";

interface PeriodFilterProps {
  period: PeriodPreset;
  from: string;
  to: string;
  onChange: (next: { period: PeriodPreset; from: string; to: string }) => void;
}

export const PeriodFilter = ({ period, from, to, onChange }: PeriodFilterProps) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2.5 }} className="no-print">
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 12, sm: 3 }}>
        <TextField
          select
          label="Period"
          fullWidth
          size="small"
          value={period}
          onChange={(e) => onChange({ period: e.target.value as PeriodPreset, from, to })}
        >
          {Object.entries(PERIOD_PRESET_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      {period === "custom" && (
        <>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DatePicker
              label="From"
              value={dayjs(from)}
              onChange={(val) => val && onChange({ period, from: val.format("YYYY-MM-DD"), to })}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DatePicker
              label="To"
              value={dayjs(to)}
              onChange={(val) => val && onChange({ period, from, to: val.format("YYYY-MM-DD") })}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
        </>
      )}
    </Grid>
  </Paper>
);
