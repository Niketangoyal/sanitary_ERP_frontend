export const TOKEN_STORAGE_KEY = "erp_token";
export const USER_STORAGE_KEY = "erp_user";
export const THEME_STORAGE_KEY = "erp_theme_mode";
export const FILTERS_STORAGE_PREFIX = "erp_filters_";

export const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"] as const;
export const ACCOUNT_TYPES = ["CASH", "BILL"] as const;
export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export const PAYMENT_MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
};

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CASH: "Cash Account",
  BILL: "Bill Account",
};
