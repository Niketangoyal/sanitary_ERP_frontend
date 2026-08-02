import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, Customer, PaginatedResponse } from "@/types";

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: "true" | "false";
}

export interface CustomerPayload {
  companyName: string;
  contactPerson?: string | null;
  mobile: string;
  address?: string | null;
  gstNumber?: string | null;
  openingCashBalance?: number;
  openingBillBalance?: number;
  notes?: string | null;
}

export interface CustomerUpdatePayload extends Partial<Omit<CustomerPayload, "openingCashBalance" | "openingBillBalance">> {
  isActive?: boolean;
}

export interface CustomerWithBalance {
  customer: Customer;
  cashBalance: number;
  billBalance: number;
  totalOutstanding: number;
  totalSales: number;
  totalPayments: number;
}

export const customerService = {
  list: async (params: CustomerListParams): Promise<PaginatedResponse<Customer>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Customer>>("/customers", { params });
    return data;
  },
  recent: async (): Promise<Customer[]> => {
    const { data } = await axiosClient.get<ApiResponse<Customer[]>>("/customers/recent");
    return data.data;
  },
  getById: async (id: string): Promise<CustomerWithBalance> => {
    const { data } = await axiosClient.get<ApiResponse<CustomerWithBalance>>(`/customers/${id}`);
    return data.data;
  },
  create: async (payload: CustomerPayload): Promise<Customer> => {
    const { data } = await axiosClient.post<ApiResponse<Customer>>("/customers", payload);
    return data.data;
  },
  update: async (id: string, payload: CustomerUpdatePayload): Promise<Customer> => {
    const { data } = await axiosClient.put<ApiResponse<Customer>>(`/customers/${id}`, payload);
    return data.data;
  },
  remove: async (id: string, force = false, reason?: string): Promise<void> => {
    await axiosClient.delete(`/customers/${id}`, { data: { force, reason } });
  },
};
