import { axiosClient } from "@/api/axiosClient";

const downloadFile = async (
  url: string,
  params: Record<string, string | undefined>,
  filename: string,
  mimeType: string,
) => {
  const response = await axiosClient.get(url, { params, responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

const downloadBlob = (url: string, params: Record<string, string | undefined>, filename: string) =>
  downloadFile(url, params, filename, "application/pdf");

export const pdfService = {
  downloadSaleInvoice: (saleId: string, invoiceNumber: string) =>
    downloadBlob(`/sales/${saleId}/pdf`, {}, `Invoice-${invoiceNumber}.pdf`),

  downloadLedger: (customerId: string, companyName: string, from?: string, to?: string) =>
    downloadBlob(`/ledger/${customerId}/pdf`, { from, to }, `Ledger-${companyName}.pdf`),

  downloadReport: (reportKey: string, params: Record<string, string | undefined>, filename: string) =>
    downloadBlob(`/reports/${reportKey}/pdf`, params, filename),

  downloadSalarySlip: (salaryRecordId: string, salaryNumber: string) =>
    downloadBlob(`/salary-records/${salaryRecordId}/pdf`, {}, `Salary-Slip-${salaryNumber.replace(/\//g, "-")}.pdf`),

  downloadLeaveReportPdf: (params: Record<string, string | undefined>) =>
    downloadBlob("/leaves/pdf", params, "Leave-Report.pdf"),

  downloadLeaveReportCsv: (params: Record<string, string | undefined>) =>
    downloadFile("/leaves/csv", params, "Leave-Report.csv", "text/csv"),
};
