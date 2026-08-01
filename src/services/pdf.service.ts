import { axiosClient } from "@/api/axiosClient";

const downloadBlob = async (url: string, params: Record<string, string | undefined>, filename: string) => {
  const response = await axiosClient.get(url, { params, responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const pdfService = {
  downloadSaleInvoice: (saleId: string, invoiceNumber: string) =>
    downloadBlob(`/sales/${saleId}/pdf`, {}, `Invoice-${invoiceNumber}.pdf`),

  downloadLedger: (customerId: string, companyName: string, from?: string, to?: string) =>
    downloadBlob(`/ledger/${customerId}/pdf`, { from, to }, `Ledger-${companyName}.pdf`),

  downloadReport: (reportKey: string, params: Record<string, string | undefined>, filename: string) =>
    downloadBlob(`/reports/${reportKey}/pdf`, params, filename),
};
