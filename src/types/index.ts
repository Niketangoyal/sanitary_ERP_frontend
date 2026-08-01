export type Role = "ADMIN" | "STAFF";
export type ProductStatus = "ACTIVE" | "INACTIVE";
export type PaymentMode = "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
export type LedgerAccountType = "CASH" | "BILL";
export type LedgerEntryType = "OPENING" | "SALE" | "RETURN" | "PAYMENT" | "ADJUSTMENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string | null;
  mobile: string;
  address: string | null;
  gstNumber: string | null;
  openingCashBalance: string;
  openingBillBalance: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOutstanding {
  customer: Customer;
  cashBalance: number;
  billBalance: number;
  totalOutstanding: number;
}

export interface Product {
  id: string;
  itemName: string;
  brand: string | null;
  category: string | null;
  specification: string | null;
  unit: string;
  purchasePrice: string;
  sellingPrice: string;
  gstPercent: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  itemName: string;
  quantity: string;
  rate: string;
  discountPercent: string;
  discountAmount: string;
  gstPercent: string;
  gstAmount: string;
  total: string;
  product?: Product;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  subtotal: string;
  discountTotal: string;
  gstTotal: string;
  grandTotal: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items?: SaleItem[];
}

export interface ReturnItem {
  id: string;
  returnId: string;
  productId: string;
  itemName: string;
  quantity: string;
  rate: string;
  gstPercent: string;
  gstAmount: string;
  total: string;
  product?: Product;
}

export interface ReturnDoc {
  id: string;
  returnNumber: string;
  returnDate: string;
  customerId: string;
  saleId: string | null;
  reason: string | null;
  subtotal: string;
  gstTotal: string;
  grandTotal: string;
  createdAt: string;
  customer?: Customer;
  sale?: Sale | null;
  items?: ReturnItem[];
}

export interface Payment {
  id: string;
  paymentNumber: string;
  customerId: string;
  date: string;
  amount: string;
  mode: PaymentMode;
  accountType: LedgerAccountType;
  remarks: string | null;
  createdAt: string;
  customer?: Customer;
}

export interface LedgerEntry {
  id: string;
  customerId: string;
  entryDate: string;
  type: LedgerEntryType;
  accountType: LedgerAccountType;
  description: string;
  referenceNumber: string | null;
  debit: string;
  credit: string;
  cashBalanceAfter: string;
  billBalanceAfter: string;
  createdAt: string;
}

export interface LedgerResponse {
  customer: Customer;
  openingCashBalance: number;
  openingBillBalance: number;
  entries: LedgerEntry[];
  closingCashBalance: number;
  closingBillBalance: number;
  closingTotalBalance: number;
}

export interface Settings {
  id: string;
  businessName: string;
  address: string | null;
  gstNumber: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  invoicePrefix: string;
  returnPrefix: string;
  paymentPrefix: string;
  invoiceFooter: string | null;
  theme: string;
}

export interface DashboardSummary {
  totalCustomers: number;
  totalOutstanding: number;
  cashOutstanding: number;
  billOutstanding: number;
  todaySales: number;
  todayPayments: number;
  todayReturns: number;
}

export interface MonthlySeriesPoint {
  month: string;
  total: number;
}

export interface RecentTransaction {
  id: string;
  type: LedgerEntryType;
  description: string;
  referenceNumber: string | null;
  amount: number;
  date: string;
  customerName: string;
}

export interface OutstandingCustomerRow {
  customerId: string;
  companyName: string;
  mobile: string;
  cashBalance: number;
  billBalance: number;
  totalOutstanding: number;
}
