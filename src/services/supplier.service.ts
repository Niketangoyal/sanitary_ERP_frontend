import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, PaginatedResponse, Supplier } from "@/types";

export interface SupplierListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: "true" | "false";
}

export interface SupplierPayload {
  name: string;
  contactPerson?: string | null;
  mobile?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
}

export interface SupplierUpdatePayload extends Partial<SupplierPayload> {
  isActive?: boolean;
}

export const supplierService = {
  list: async (params: SupplierListParams): Promise<PaginatedResponse<Supplier>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Supplier>>("/suppliers", { params });
    return data;
  },
  getById: async (id: string): Promise<Supplier> => {
    const { data } = await axiosClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return data.data;
  },
  create: async (payload: SupplierPayload): Promise<Supplier> => {
    const { data } = await axiosClient.post<ApiResponse<Supplier>>("/suppliers", payload);
    return data.data;
  },
  update: async (id: string, payload: SupplierUpdatePayload): Promise<Supplier> => {
    const { data } = await axiosClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, payload);
    return data.data;
  },
  remove: async (id: string, reason?: string): Promise<void> => {
    await axiosClient.delete(`/suppliers/${id}`, { data: { reason } });
  },
};
