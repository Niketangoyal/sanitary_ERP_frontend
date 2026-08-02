export const TOKEN_STORAGE_KEY = "erp_token";
export const USER_STORAGE_KEY = "erp_user";
export const THEME_STORAGE_KEY = "erp_theme_mode";
export const FILTERS_STORAGE_PREFIX = "erp_filters_";

export const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"] as const;
export const ACCOUNT_TYPES = ["CASH", "BILL"] as const;
export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export const SALE_TYPES = ["CASH", "BILL"] as const;
export const PAYMENT_STATUSES = ["PAID", "UNPAID", "PARTIAL"] as const;

export const PAYMENT_MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
  OTHER: "Other",
};

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CASH: "Cash Account",
  BILL: "Bill Account",
};

export const SALE_TYPE_LABELS: Record<string, string> = {
  CASH: "Cash (Kacha)",
  BILL: "Bill (Pakka)",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: "Paid",
  UNPAID: "Unpaid",
  PARTIAL: "Partially Paid",
};

export const PAYMENT_STATUS_COLORS: Record<string, "success" | "error" | "warning"> = {
  PAID: "success",
  UNPAID: "error",
  PARTIAL: "warning",
};

export const PERIOD_PRESET_LABELS: Record<string, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
  custom: "Custom",
};

export const EMPLOYMENT_STATUSES = ["ACTIVE", "INACTIVE", "LEFT"] as const;
export const SALARY_TYPES = ["MONTHLY", "DAILY"] as const;
export const LEAVE_TYPES = ["CASUAL", "SICK", "PAID", "UNPAID", "OTHER"] as const;

export const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  LEFT: "Left",
};

export const EMPLOYMENT_STATUS_COLORS: Record<string, "success" | "default" | "error"> = {
  ACTIVE: "success",
  INACTIVE: "default",
  LEFT: "error",
};

export const SALARY_TYPE_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  DAILY: "Daily",
};

export const SALARY_PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  PARTIAL: "Partially Paid",
};

export const SALARY_PAYMENT_STATUS_COLORS: Record<string, "success" | "error" | "warning"> = {
  PAID: "success",
  PENDING: "error",
  PARTIAL: "warning",
};

export const ADVANCE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PARTIALLY_ADJUSTED: "Partially Adjusted",
  FULLY_ADJUSTED: "Fully Adjusted",
};

export const ADVANCE_STATUS_COLORS: Record<string, "success" | "warning" | "error"> = {
  PENDING: "error",
  PARTIALLY_ADJUSTED: "warning",
  FULLY_ADJUSTED: "success",
};

export const LEAVE_TYPE_LABELS: Record<string, string> = {
  CASUAL: "Casual Leave",
  SICK: "Sick Leave",
  PAID: "Paid Leave",
  UNPAID: "Unpaid Leave",
  OTHER: "Other",
};

export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
