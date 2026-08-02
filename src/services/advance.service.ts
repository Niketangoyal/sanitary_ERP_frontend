import { axiosClient } from "@/api/axiosClient";
import type {
  AdvanceAdjustment,
  AdvancePayment,
  AdvancePendingRow,
  AdvancePendingSummary,
  ApiResponse,
} from "@/types";

export interface CreateAdvancePayload {
  date: string;
  amount: number;
  reason?: string;
}

export interface AdjustmentHistoryParams {
  employeeId?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}

export const advanceService = {
  list: async (employeeId: string): Promise<AdvancePayment[]> => {
    const { data } = await axiosClient.get<ApiResponse<AdvancePayment[]>>(
      `/employees/${employeeId}/advances`,
    );
    return data.data;
  },
  create: async (employeeId: string, payload: CreateAdvancePayload): Promise<AdvancePayment> => {
    const { data } = await axiosClient.post<ApiResponse<AdvancePayment>>(
      `/employees/${employeeId}/advances`,
      payload,
    );
    return data.data;
  },
  update: async (
    employeeId: string,
    id: string,
    payload: Partial<CreateAdvancePayload>,
  ): Promise<AdvancePayment> => {
    const { data } = await axiosClient.put<ApiResponse<AdvancePayment>>(
      `/employees/${employeeId}/advances/${id}`,
      payload,
    );
    return data.data;
  },
  remove: async (employeeId: string, id: string, reason?: string): Promise<void> => {
    await axiosClient.delete(`/employees/${employeeId}/advances/${id}`, { data: { reason } });
  },
  pendingSummary: async (employeeId: string): Promise<AdvancePendingSummary> => {
    const { data } = await axiosClient.get<ApiResponse<AdvancePendingSummary>>(
      `/employees/${employeeId}/advances/pending-summary`,
    );
    return data.data;
  },
  pendingReport: async (): Promise<AdvancePendingRow[]> => {
    const { data } = await axiosClient.get<ApiResponse<AdvancePendingRow[]>>("/advance-reports/pending");
    return data.data;
  },
  adjustmentHistory: async (params: AdjustmentHistoryParams): Promise<AdvanceAdjustment[]> => {
    const { data } = await axiosClient.get<ApiResponse<AdvanceAdjustment[]>>("/advance-reports/adjustments", {
      params,
    });
    return data.data;
  },
};
