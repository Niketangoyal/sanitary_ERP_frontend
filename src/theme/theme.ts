import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

const shape = { borderRadius: 12 };

const typography: ThemeOptions["typography"] = {
  fontFamily: ['"Inter"', '"Segoe UI"', "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
  h4: { fontWeight: 700 },
  h5: { fontWeight: 700 },
  h6: { fontWeight: 600 },
  subtitle1: { fontWeight: 600 },
  button: { fontWeight: 600, textTransform: "none" },
};

const componentOverrides: ThemeOptions["components"] = {
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: "none" },
      rounded: { borderRadius: 12 },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 14,
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 10, paddingInline: 16 },
      containedPrimary: {
        boxShadow: "none",
        "&:hover": { boxShadow: "0 4px 12px rgba(20, 92, 158, 0.25)" },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: { fontWeight: 700, whiteSpace: "nowrap" },
    },
  },
  MuiChip: {
    styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
  },
  MuiTextField: {
    defaultProps: { size: "small" },
  },
  MuiAppBar: {
    styleOverrides: {
      root: { boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)" },
    },
  },
};

export const getAppTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#145C9E", light: "#3E82C4", dark: "#0D3F6E" },
      secondary: { main: "#0E9384" },
      success: { main: "#1E8E5A" },
      warning: { main: "#C77700" },
      error: { main: "#D23C3C" },
      background:
        mode === "light"
          ? { default: "#F4F6F9", paper: "#FFFFFF" }
          : { default: "#0F1621", paper: "#171F2C" },
    },
    shape,
    typography,
    components: componentOverrides,
  });
