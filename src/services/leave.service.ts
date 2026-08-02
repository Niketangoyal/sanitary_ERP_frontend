import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, LeaveRecord, LeaveType, PaginatedResponse } from "@/types";

export interface CreateLeavePayload {
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason?: string;
}

export type UpdateLeavePayload = Partial<CreateLeavePayload>;

export interface LeaveListParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}

export const leaveService = {
  listForEmployee: async (employeeId: string): Promise<LeaveRecord[]> => {
    const { data } = await axiosClient.get<ApiResponse<LeaveRecord[]>>(`/employees/${employeeId}/leaves`);
    return data.data;
  },
  create: async (employeeId: string, payload: CreateLeavePayload): Promise<LeaveRecord> => {
    const { data } = await axiosClient.post<ApiResponse<LeaveRecord>>(
      `/employees/${employeeId}/leaves`,
      payload,
    );
    return data.data;
  },
  list: async (params: LeaveListParams): Promise<PaginatedResponse<LeaveRecord>> => {
    const { data } = await axiosClient.get<PaginatedResponse<LeaveRecord>>("/leaves", { params });
    return data;
  },
  update: async (id: string, payload: UpdateLeavePayload): Promise<LeaveRecord> => {
    const { data } = await axiosClient.put<ApiResponse<LeaveRecord>>(`/leaves/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/leaves/${id}`);
  },
};
