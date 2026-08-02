import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, LedgerAccountType, PaginatedResponse, Payment, PaymentMode } from "@/types";

export interface CreatePaymentPayload {
  customerId: string;
  date: string;
  amount: number;
  mode: PaymentMode;
  accountType: LedgerAccountType;
  remarks?: string;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  customerId?: string;
  mode?: PaymentMode;
  from?: string;
  to?: string;
}

export const paymentService = {
  list: async (params: PaymentListParams): Promise<PaginatedResponse<Payment>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Payment>>("/payments", { params });
    return data;
  },
  recent: async (): Promise<Payment[]> => {
    const { data } = await axiosClient.get<ApiResponse<Payment[]>>("/payments/recent");
    return data.data;
  },
  getById: async (id: string): Promise<Payment> => {
    const { data } = await axiosClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return data.data;
  },
  create: async (payload: CreatePaymentPayload): Promise<Payment> => {
    const { data } = await axiosClient.post<ApiResponse<Payment>>("/payments", payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<Omit<CreatePaymentPayload, "customerId">>): Promise<Payment> => {
    const { data } = await axiosClient.put<ApiResponse<Payment>>(`/payments/${id}`, payload);
    return data.data;
  },
  remove: async (id: string, reason?: string): Promise<void> => {
    await axiosClient.delete(`/payments/${id}`, { data: { reason } });
  },
};
