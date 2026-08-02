import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, Employee, EmploymentStatus, PaginatedResponse, SalaryType } from "@/types";

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  employmentStatus?: EmploymentStatus;
}

export interface EmployeePayload {
  fullName: string;
  mobile: string;
  address?: string | null;
  email?: string | null;
  dateOfJoining: string;
  department?: string | null;
  designation?: string | null;
  salaryType: SalaryType;
  currentSalary: number;
  employmentStatus: EmploymentStatus;
  notes?: string | null;
}

export type EmployeeUpdatePayload = Partial<Omit<EmployeePayload, "currentSalary" | "dateOfJoining">>;

export const employeeService = {
  list: async (params: EmployeeListParams): Promise<PaginatedResponse<Employee>> => {
    const { data } = await axiosClient.get<PaginatedResponse<Employee>>("/employees", { params });
    return data;
  },
  getById: async (id: string): Promise<Employee> => {
    const { data } = await axiosClient.get<ApiResponse<Employee>>(`/employees/${id}`);
    return data.data;
  },
  create: async (payload: EmployeePayload): Promise<Employee> => {
    const { data } = await axiosClient.post<ApiResponse<Employee>>("/employees", payload);
    return data.data;
  },
  update: async (id: string, payload: EmployeeUpdatePayload): Promise<Employee> => {
    const { data } = await axiosClient.put<ApiResponse<Employee>>(`/employees/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/employees/${id}`);
  },
};
