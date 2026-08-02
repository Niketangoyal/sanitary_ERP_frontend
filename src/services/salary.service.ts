import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, PaginatedResponse, PaymentMode, SalaryPaymentStatus, SalaryRecord } from "@/types";

export interface GenerateSalaryPayload {
  month: number;
  year: number;
  advanceAdjustment?: number;
}

export interface PaySalaryPayload {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMode;
  remarks?: string;
}

export interface UpdateSalaryRecordPayload {
  advanceAdjustment: number;
  notes?: string | null;
}

export interface SalaryListParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  month?: string;
  year?: string;
  paymentStatus?: SalaryPaymentStatus;
}

export const salaryService = {
  listForEmployee: async (employeeId: string): Promise<SalaryRecord[]> => {
    const { data } = await axiosClient.get<ApiResponse<SalaryRecord[]>>(`/employees/${employeeId}/salary`);
    return data.data;
  },
  generate: async (employeeId: string, payload: GenerateSalaryPayload): Promise<SalaryRecord> => {
    const { data } = await axiosClient.post<ApiResponse<SalaryRecord>>(
      `/employees/${employeeId}/salary/generate`,
      payload,
    );
    return data.data;
  },
  list: async (params: SalaryListParams): Promise<PaginatedResponse<SalaryRecord>> => {
    const { data } = await axiosClient.get<PaginatedResponse<SalaryRecord>>("/salary-records", { params });
    return data;
  },
  getById: async (id: string): Promise<SalaryRecord> => {
    const { data } = await axiosClient.get<ApiResponse<SalaryRecord>>(`/salary-records/${id}`);
    return data.data;
  },
  pay: async (id: string, payload: PaySalaryPayload): Promise<SalaryRecord> => {
    const { data } = await axiosClient.post<ApiResponse<SalaryRecord>>(`/salary-records/${id}/pay`, payload);
    return data.data;
  },
  update: async (id: string, payload: UpdateSalaryRecordPayload): Promise<SalaryRecord> => {
    const { data } = await axiosClient.put<ApiResponse<SalaryRecord>>(`/salary-records/${id}`, payload);
    return data.data;
  },
  remove: async (id: string, reason?: string): Promise<void> => {
    await axiosClient.delete(`/salary-records/${id}`, { data: { reason } });
  },
  updatePayment: async (
    salaryRecordId: string,
    paymentId: string,
    payload: PaySalaryPayload,
  ): Promise<SalaryRecord> => {
    const { data } = await axiosClient.put<ApiResponse<SalaryRecord>>(
      `/salary-records/${salaryRecordId}/payments/${paymentId}`,
      payload,
    );
    return data.data;
  },
  deletePayment: async (salaryRecordId: string, paymentId: string, reason?: string): Promise<SalaryRecord> => {
    const { data } = await axiosClient.delete<ApiResponse<SalaryRecord>>(
      `/salary-records/${salaryRecordId}/payments/${paymentId}`,
      { data: { reason } },
    );
    return data.data;
  },
};
