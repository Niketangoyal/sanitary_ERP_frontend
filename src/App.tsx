import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SnackbarProvider } from "notistack";
import { ThemeModeProvider } from "@/context/ThemeModeContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppRouter } from "@/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

export default App;
