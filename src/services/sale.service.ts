import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, PaginatedResponse, PaymentMode, PaymentStatus, Sale, SaleType } from "@/types";

export interface SaleItemPayload {
  productId: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  gstPercent?: number;
}

export interface CreateSalePayload {
  customerId: string;
  invoiceDate: string;
  saleType: SaleType;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMode;
  amountPaid?: number;
  notes?: string;
  items: SaleItemPayload[];
}

export interface SaleListParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  saleType?: SaleType;
  paymentStatus?: PaymentStatus;
  from?: string;
  to?: string;
}

export const saleService = {
  list: async (params: SaleListParams): Promise<PaginatedResponse<Sale>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Sale>>("/sales", { params });
    return data;
  },
  recent: async (): Promise<Sale[]> => {
    const { data } = await axiosClient.get<ApiResponse<Sale[]>>("/sales/recent");
    return data.data;
  },
  getById: async (id: string): Promise<Sale> => {
    const { data } = await axiosClient.get<ApiResponse<Sale>>(`/sales/${id}`);
    return data.data;
  },
  create: async (payload: CreateSalePayload): Promise<Sale> => {
    const { data } = await axiosClient.post<ApiResponse<Sale>>("/sales", payload);
    return data.data;
  },
  update: async (id: string, payload: Omit<CreateSalePayload, "customerId">): Promise<Sale> => {
    const { data } = await axiosClient.put<ApiResponse<Sale>>(`/sales/${id}`, payload);
    return data.data;
  },
  remove: async (id: string, reason?: string): Promise<void> => {
    await axiosClient.delete(`/sales/${id}`, { data: { reason } });
  },
};
