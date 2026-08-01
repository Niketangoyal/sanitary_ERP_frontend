import dayjs from "dayjs";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const inrPlain = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export const formatCurrency = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return inr.format(Number.isFinite(num) ? num : 0);
};

export const formatNumber = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return inrPlain.format(Number.isFinite(num) ? num : 0);
};

/** Accounting-style balance display, e.g. "12,500.00 Dr" / "500.00 Cr". */
export const formatBalance = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const safe = Number.isFinite(num) ? num : 0;
  const suffix = safe < 0 ? "Cr" : "Dr";
  return `${inrPlain.format(Math.abs(safe))} ${suffix}`;
};

export const formatDate = (value: string | Date | null | undefined): string =>
  value ? dayjs(value).format("DD-MM-YYYY") : "-";

export const formatDateTime = (value: string | Date | null | undefined): string =>
  value ? dayjs(value).format("DD-MM-YYYY hh:mm A") : "-";

export const toApiDate = (value: string | Date | null | undefined): string | undefined =>
  value ? dayjs(value).format("YYYY-MM-DD") : undefined;
