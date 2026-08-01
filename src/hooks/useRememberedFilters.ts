import { useEffect, useState } from "react";
import { FILTERS_STORAGE_PREFIX } from "@/utils/constants";

/** Persists filter state to localStorage per module key ("Remember Filters" feature). */
export const useRememberedFilters = <T extends Record<string, unknown>>(key: string, initial: T) => {
  const storageKey = `${FILTERS_STORAGE_PREFIX}${key}`;

  const [filters, setFilters] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? { ...initial, ...(JSON.parse(raw) as Partial<T>) } : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(filters));
  }, [storageKey, filters]);

  return [filters, setFilters] as const;
};
