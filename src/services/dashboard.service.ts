import { axiosClient } from "@/api/axiosClient";
import type {
  ApiResponse,
  DashboardPeriodSummary,
  DashboardSummary,
  OutstandingCustomerRow,
  PeriodPreset,
  RecentTransaction,
} from "@/types";
import type { MonthlySalesRow } from "@/services/report.service";

export const dashboardService = {
  summary: async (): Promise<DashboardSummary> => {
    const { data } = await axiosClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
    return data.data;
  },
  periodSummary: async (period: PeriodPreset, from?: string, to?: string): Promise<DashboardPeriodSummary> => {
    const { data } = await axiosClient.get<ApiResponse<DashboardPeriodSummary>>(
      "/dashboard/period-summary",
      { params: { period, from, to } },
    );
    return data.data;
  },
  monthlySales: async (year?: number): Promise<MonthlySalesRow[]> => {
    const { data } = await axiosClient.get<ApiResponse<MonthlySalesRow[]>>("/dashboard/monthly-sales", {
      params: { year },
    });
    return data.data;
  },
  monthlyCollections: async (year?: number): Promise<MonthlySalesRow[]> => {
    const { data } = await axiosClient.get<ApiResponse<MonthlySalesRow[]>>(
      "/dashboard/monthly-collections",
      { params: { year } },
    );
    return data.data;
  },
  recentTransactions: async (limit = 10): Promise<RecentTransaction[]> => {
    const { data } = await axiosClient.get<ApiResponse<RecentTransaction[]>>(
      "/dashboard/recent-transactions",
      { params: { limit } },
    );
    return data.data;
  },
  outstandingCustomers: async (limit = 10): Promise<OutstandingCustomerRow[]> => {
    const { data } = await axiosClient.get<ApiResponse<OutstandingCustomerRow[]>>(
      "/dashboard/outstanding-customers",
      { params: { limit } },
    );
    return data.data;
  },
};
