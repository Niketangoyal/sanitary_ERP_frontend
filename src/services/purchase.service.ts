import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, PaginatedResponse, StockBatch } from "@/types";

export interface CreatePurchasePayload {
  productId: string;
  purchasePrice: number;
  quantity: number;
  purchaseDate: string;
  supplierId?: string | null;
  supplier?: string;
}

export type UpdatePurchasePayload = Partial<Omit<CreatePurchasePayload, "productId">>;

export interface PurchaseListParams {
  page?: number;
  limit?: number;
  productId?: string;
  from?: string;
  to?: string;
}

export const purchaseService = {
  list: async (params: PurchaseListParams): Promise<PaginatedResponse<StockBatch>> => {
    const { data } = await axiosClient.get<PaginatedResponse<StockBatch>>("/purchases", { params });
    return data;
  },
  stockLevels: async (): Promise<Record<string, number>> => {
    const { data } = await axiosClient.get<ApiResponse<Record<string, number>>>(
      "/purchases/stock-levels",
    );
    return data.data;
  },
  getById: async (id: string): Promise<StockBatch> => {
    const { data } = await axiosClient.get<ApiResponse<StockBatch>>(`/purchases/${id}`);
    return data.data;
  },
  create: async (payload: CreatePurchasePayload): Promise<StockBatch> => {
    const { data } = await axiosClient.post<ApiResponse<StockBatch>>("/purchases", payload);
    return data.data;
  },
  update: async (id: string, payload: UpdatePurchasePayload): Promise<StockBatch> => {
    const { data } = await axiosClient.put<ApiResponse<StockBatch>>(`/purchases/${id}`, payload);
    return data.data;
  },
  remove: async (id: string, reason?: string): Promise<void> => {
    await axiosClient.delete(`/purchases/${id}`, { data: { reason } });
  },
};
