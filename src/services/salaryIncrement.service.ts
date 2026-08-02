import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, SalaryIncrement } from "@/types";

export interface CreateIncrementPayload {
  newSalary: number;
  effectiveDate: string;
  reason?: string;
}

export const salaryIncrementService = {
  list: async (employeeId: string): Promise<SalaryIncrement[]> => {
    const { data } = await axiosClient.get<ApiResponse<SalaryIncrement[]>>(
      `/employees/${employeeId}/increments`,
    );
    return data.data;
  },
  create: async (employeeId: string, payload: CreateIncrementPayload): Promise<SalaryIncrement> => {
    const { data } = await axiosClient.post<ApiResponse<SalaryIncrement>>(
      `/employees/${employeeId}/increments`,
      payload,
    );
    return data.data;
  },
};
