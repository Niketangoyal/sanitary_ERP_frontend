import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResult> => {
    const { data } = await axiosClient.post<ApiResponse<LoginResult>>("/auth/login", payload);
    return data.data;
  },
  me: async (): Promise<User> => {
    const { data } = await axiosClient.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },
  logout: async (): Promise<void> => {
    await axiosClient.post("/auth/logout");
  },
};
