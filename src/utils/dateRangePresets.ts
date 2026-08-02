import dayjs from "dayjs";
import type { PeriodPreset } from "@/types";

/** Mirrors the backend's resolvePeriodRange so preset labels and dates stay in sync. */
export const resolvePeriodRange = (
  period: PeriodPreset,
  customFrom?: string,
  customTo?: string,
): { from: string; to: string } => {
  const now = dayjs();

  switch (period) {
    case "today":
      return { from: now.format("YYYY-MM-DD"), to: now.format("YYYY-MM-DD") };
    case "week":
      return { from: now.startOf("week").format("YYYY-MM-DD"), to: now.format("YYYY-MM-DD") };
    case "month":
      return { from: now.startOf("month").format("YYYY-MM-DD"), to: now.format("YYYY-MM-DD") };
    case "year":
      return { from: now.startOf("year").format("YYYY-MM-DD"), to: now.format("YYYY-MM-DD") };
    case "custom":
    default:
      return {
        from: customFrom ?? now.startOf("month").format("YYYY-MM-DD"),
        to: customTo ?? now.format("YYYY-MM-DD"),
      };
  }
};
