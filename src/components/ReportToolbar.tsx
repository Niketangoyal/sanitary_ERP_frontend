import { Button, Stack } from "@mui/material";
import PrintIcon from "@mui/icons-material/PrintOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdfOutlined";

interface ReportToolbarProps {
  onExportPdf: () => void;
  exporting?: boolean;
}

export const ReportToolbar = ({ onExportPdf, exporting }: ReportToolbarProps) => (
  <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mb: 2 }} className="no-print">
    <Button startIcon={<PrintIcon />} onClick={() => window.print()}>
      Print
    </Button>
    <Button
      variant="contained"
      startIcon={<PictureAsPdfIcon />}
      onClick={onExportPdf}
      disabled={exporting}
    >
      Export PDF
    </Button>
  </Stack>
);
