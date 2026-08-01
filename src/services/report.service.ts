import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, PaymentMode, Sale, ReturnDoc, Payment, OutstandingCustomerRow } from "@/types";

export interface ReportRangeParams {
  from?: string;
  to?: string;
  customerId?: string;
}

export interface OutstandingReportData {
  rows: OutstandingCustomerRow[];
  totals: { cashBalance: number; billBalance: number; totalOutstanding: number };
}

export interface SalesReportData {
  rows: Sale[];
  totals: { subtotal: number; discountTotal: number; gstTotal: number; grandTotal: number };
  count: number;
}

export interface ReturnReportData {
  rows: ReturnDoc[];
  totals: { subtotal: number; gstTotal: number; grandTotal: number };
  count: number;
}

export interface PaymentReportData {
  rows: Payment[];
  totals: number;
  count: number;
}

export interface ItemWiseSalesRow {
  productId: string;
  itemName: string;
  brand: string | null;
  category: string | null;
  quantitySold: number;
  totalSales: number;
  totalGst: number;
}

export interface ItemWiseSalesReportData {
  rows: ItemWiseSalesRow[];
  totals: { quantitySold: number; totalSales: number };
}

export interface MonthlySalesRow {
  month: string;
  label: string;
  total: number;
  count: number;
}

export interface DateWiseSalesRow {
  date: string;
  total: number;
  count: number;
}

export const reportService = {
  outstanding: async (): Promise<OutstandingReportData> => {
    const { data } = await axiosClient.get<ApiResponse<OutstandingReportData>>("/reports/outstanding");
    return data.data;
  },
  sales: async (params: ReportRangeParams): Promise<SalesReportData> => {
    const { data } = await axiosClient.get<ApiResponse<SalesReportData>>("/reports/sales", { params });
    return data.data;
  },
  returns: async (params: ReportRangeParams): Promise<ReturnReportData> => {
    const { data } = await axiosClient.get<ApiResponse<ReturnReportData>>("/reports/returns", { params });
    return data.data;
  },
  payments: async (params: ReportRangeParams & { mode?: PaymentMode }): Promise<PaymentReportData> => {
    const { data } = await axiosClient.get<ApiResponse<PaymentReportData>>("/reports/payments", { params });
    return data.data;
  },
  itemWiseSales: async (params: ReportRangeParams): Promise<ItemWiseSalesReportData> => {
    const { data } = await axiosClient.get<ApiResponse<ItemWiseSalesReportData>>(
      "/reports/item-wise-sales",
      { params },
    );
    return data.data;
  },
  monthlySales: async (year?: number): Promise<MonthlySalesRow[]> => {
    const { data } = await axiosClient.get<ApiResponse<MonthlySalesRow[]>>("/reports/monthly-sales", {
      params: { year },
    });
    return data.data;
  },
  dateWiseSales: async (params: ReportRangeParams): Promise<DateWiseSalesRow[]> => {
    const { data } = await axiosClient.get<ApiResponse<DateWiseSalesRow[]>>("/reports/date-wise-sales", {
      params,
    });
    return data.data;
  },
};
