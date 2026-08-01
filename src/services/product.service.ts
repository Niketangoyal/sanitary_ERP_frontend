import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, PaginatedResponse, Product, ProductStatus } from "@/types";

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: ProductStatus;
}

export interface ProductPayload {
  itemName: string;
  brand?: string | null;
  category?: string | null;
  specification?: string | null;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercent: number;
  status: ProductStatus;
}

export const productService = {
  list: async (params: ProductListParams): Promise<PaginatedResponse<Product>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Product>>("/products", { params });
    return data;
  },
  recent: async (): Promise<Product[]> => {
    const { data } = await axiosClient.get<ApiResponse<Product[]>>("/products/recent");
    return data.data;
  },
  categories: async (): Promise<string[]> => {
    const { data } = await axiosClient.get<ApiResponse<string[]>>("/products/categories");
    return data.data;
  },
  getById: async (id: string): Promise<Product> => {
    const { data } = await axiosClient.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data;
  },
  create: async (payload: ProductPayload): Promise<Product> => {
    const { data } = await axiosClient.post<ApiResponse<Product>>("/products", payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<ProductPayload>): Promise<Product> => {
    const { data } = await axiosClient.put<ApiResponse<Product>>(`/products/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/products/${id}`);
  },
};
