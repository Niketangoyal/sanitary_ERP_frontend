import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, PaginatedResponse, ReturnDoc } from "@/types";

export interface ReturnItemPayload {
  productId: string;
  quantity: number;
  rate: number;
  gstPercent?: number;
}

export interface CreateReturnPayload {
  customerId: string;
  returnDate: string;
  saleId?: string;
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
  create: async (payload: CreateReturnPayload): Promise<ReturnDoc> => {
    const { data } = await axiosClient.post<ApiResponse<ReturnDoc>>("/returns", payload);
    return data.data;
  },
};
