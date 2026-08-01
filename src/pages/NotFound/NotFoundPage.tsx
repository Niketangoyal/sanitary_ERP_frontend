import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh" }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h2" fontWeight={700} color="primary.main">
          404
        </Typography>
        <Typography variant="h6">Page not found</Typography>
        <Typography color="text.secondary">
          The page you are looking for doesn&apos;t exist or has been moved.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </Stack>
    </Box>
  );
};

export default NotFoundPage;
