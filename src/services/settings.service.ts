import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, Settings } from "@/types";

export interface UpdateSettingsPayload {
  businessName?: string;
  address?: string | null;
  gstNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  invoicePrefix?: string;
  returnPrefix?: string;
  paymentPrefix?: string;
  invoiceFooter?: string | null;
  theme?: "light" | "dark";
}

export const settingsService = {
  get: async (): Promise<Settings> => {
    const { data } = await axiosClient.get<ApiResponse<Settings>>("/settings");
    return data.data;
  },
  update: async (payload: UpdateSettingsPayload): Promise<Settings> => {
    const { data } = await axiosClient.put<ApiResponse<Settings>>("/settings", payload);
    return data.data;
  },
  uploadLogo: async (file: File): Promise<Settings> => {
    const formData = new FormData();
    formData.append("logo", file);
    const { data } = await axiosClient.post<ApiResponse<Settings>>("/settings/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
};
