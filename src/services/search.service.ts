import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse } from "@/types";

export interface SearchResultItem {
  type: "customer" | "product" | "invoice";
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export const searchService = {
  search: async (query: string): Promise<SearchResultItem[]> => {
    const { data } = await axiosClient.get<ApiResponse<SearchResultItem[]>>("/search", {
      params: { q: query },
    });
    return data.data;
  },
};
