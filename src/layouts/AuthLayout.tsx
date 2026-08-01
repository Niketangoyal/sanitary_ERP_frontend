import { Outlet } from "react-router-dom";
import { Box, Paper, Stack, Typography, Avatar } from "@mui/material";

export const AuthLayout = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "background.default",
      backgroundImage:
        "radial-gradient(circle at top left, rgba(20,92,158,0.08), transparent 45%), radial-gradient(circle at bottom right, rgba(14,147,132,0.08), transparent 45%)",
      p: 2,
    }}
  >
    <Paper sx={{ width: "100%", maxWidth: 420, p: 4, borderRadius: 4 }} elevation={0} variant="outlined">
      <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48, fontWeight: 700 }}>
          SB
        </Avatar>
        <Typography variant="h6">Sanitary ERP</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Wholesale management for sanitary &amp; bathroom fittings
        </Typography>
      </Stack>
      <Outlet />
    </Paper>
  </Box>
);
