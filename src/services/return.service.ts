import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, PaginatedResponse, ReturnDoc, ReturnEligibleItem } from "@/types";

export interface ReturnItemPayload {
  productId: string;
  quantity: number;
  rate: number;
  gstPercent?: number;
}

export interface CreateReturnPayload {
  customerId: string;
  returnDate: string;
  saleId: string;
  reason?: string;
  items: ReturnItemPayload[];
}

export interface UpdateReturnPayload {
  returnDate: string;
  reason?: string;
  items: ReturnItemPayload[];
}

export interface ReturnListParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  from?: string;
  to?: string;
}

export const returnService = {
  list: async (params: ReturnListParams): Promise<PaginatedResponse<ReturnDoc>> => {
    const { data } = await axiosClient.get<PaginatedResponse<ReturnDoc>>("/returns", { params });
    return data;
  },
  recent: async (): Promise<ReturnDoc[]> => {
    const { data } = await axiosClient.get<ApiResponse<ReturnDoc[]>>("/returns/recent");
    return data.data;
  },
  getById: async (id: string): Promise<ReturnDoc> => {
    const { data } = await axiosClient.get<ApiResponse<ReturnDoc>>(`/returns/${id}`);
    return data.data;
  },
  eligibleItems: async (saleId: string, excludeReturnId?: string): Promise<ReturnEligibleItem[]> => {
    const { data } = await axiosClient.get<ApiResponse<ReturnEligibleItem[]>>(
      `/returns/eligible-items/${saleId}`,
      { params: excludeReturnId ? { excludeReturnId } : undefined },
    );
    return data.data;
  },
  create: async (payload: CreateReturnPayload): Promise<ReturnDoc> => {
    const { data } = await axiosClient.post<ApiResponse<ReturnDoc>>("/returns", payload);
    return data.data;
  },
  update: async (id: string, payload: UpdateReturnPayload): Promise<ReturnDoc> => {
    const { data } = await axiosClient.put<ApiResponse<ReturnDoc>>(`/returns/${id}`, payload);
    return data.data;
  },
  delete: async (id: string, reason?: string): Promise<ReturnDoc> => {
    const { data } = await axiosClient.delete<ApiResponse<ReturnDoc>>(`/returns/${id}`, { data: { reason } });
    return data.data;
  },
};
