import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/PrintOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageLoader";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { saleService } from "@/services/sale.service";
import { settingsService } from "@/services/settings.service";
import { pdfService } from "@/services/pdf.service";

export const SaleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: sale, isLoading: saleLoading } = useQuery({
    queryKey: ["sales", id],
    queryFn: () => saleService.getById(id as string),
    enabled: !!id,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsService.get,
  });

  if (saleLoading || settingsLoading || !sale || !settings) return <PageLoader />;

  return (
    <>
      <PageHeader
        title={`Invoice ${sale.invoiceNumber}`}
        actions={
          <Stack direction="row" spacing={1.5} className="no-print">
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/sales")}>
              Back
            </Button>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => pdfService.downloadSaleInvoice(sale.id, sale.invoiceNumber)}
            >
              Export PDF
            </Button>
          </Stack>
        }
      />

      <InvoiceDocument sale={sale} settings={settings} />
    </>
  );
};

export default SaleDetailPage;
