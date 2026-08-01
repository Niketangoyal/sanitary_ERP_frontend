import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface StatCardProps {
  label: string;
  value: string;
  icon: SvgIconComponent;
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  hint?: string;
}

export const StatCard = ({ label, value, icon: Icon, color = "primary", hint }: StatCardProps) => (
  <Card>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            bgcolor: (theme) => `${theme.palette[color].main}1A`,
            color: (theme) => theme.palette[color].main,
            width: 48,
            height: 48,
          }}
        >
          <Icon fontSize="small" />
        </Avatar>
        <Stack spacing={0.25}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6">{value}</Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);
