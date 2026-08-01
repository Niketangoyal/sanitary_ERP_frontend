import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, LedgerResponse } from "@/types";

export interface LedgerParams {
  from?: string;
  to?: string;
}

export const ledgerService = {
  getStatement: async (customerId: string, params: LedgerParams): Promise<LedgerResponse> => {
    const { data } = await axiosClient.get<ApiResponse<LedgerResponse>>(`/ledger/${customerId}`, {
      params,
    });
    return data.data;
  },
};
