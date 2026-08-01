import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/types";

interface UsePaginatedQueryOptions<TFilters extends Record<string, unknown>, TItem> {
  queryKey: string;
  initialFilters?: TFilters;
  initialLimit?: number;
  fetcher: (params: TFilters & { page: number; limit: number }) => Promise<PaginatedResponse<TItem>>;
}

/**
 * Shared page/limit/filters state + TanStack Query wiring for list pages
 * that hit a server-paginated endpoint. Every module list (customers,
 * products, sales, ...) follows the same shape, so this collapses that
 * boilerplate into one hook instead of repeating it per page.
 */
export const usePaginatedQuery = <TFilters extends Record<string, unknown>, TItem>({
  queryKey,
  initialFilters,
  initialLimit = 20,
  fetcher,
}: UsePaginatedQueryOptions<TFilters, TItem>) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFiltersState] = useState<TFilters>((initialFilters ?? {}) as TFilters);

  const params = { ...filters, page, limit } as TFilters & { page: number; limit: number };

  const query = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => fetcher(params),
    placeholderData: (prev) => prev,
  });

  const setFilters = (next: Partial<TFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const handleRowsPerPageChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    filters,
    setFilters,
    page,
    setPage,
    limit,
    setRowsPerPage: handleRowsPerPageChange,
    refetch: query.refetch,
  };
};
