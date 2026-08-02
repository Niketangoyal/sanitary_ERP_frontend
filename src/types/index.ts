export type Role = "ADMIN" | "STAFF";
export type ProductStatus = "ACTIVE" | "INACTIVE";
export type PaymentMode = "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";
export type LedgerAccountType = "CASH" | "BILL";
export type LedgerEntryType = "OPENING" | "SALE" | "RETURN" | "PAYMENT" | "ADJUSTMENT";
// Sale Type: Cash (Kacha, no GST invoice) vs Bill (Pakka, GST invoice) — independent of PaymentStatus.
export type SaleType = "CASH" | "BILL";
export type PaymentStatus = "PAID" | "UNPAID" | "PARTIAL";

export type SalaryType = "MONTHLY" | "DAILY";
export type EmploymentStatus = "ACTIVE" | "INACTIVE" | "LEFT";
export type SalaryPaymentStatus = "PAID" | "PENDING" | "PARTIAL";
export type AdvanceStatus = "PENDING" | "PARTIALLY_ADJUSTED" | "FULLY_ADJUSTED";
export type LeaveType = "CASUAL" | "SICK" | "PAID" | "UNPAID" | "OTHER";

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
  deletedAt: string | null;
  deletionReason: string | null;
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
  costOfGoods: string;
  product?: Product;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  saleType: SaleType;
  subtotal: string;
  discountTotal: string;
  gstTotal: string;
  grandTotal: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMode | null;
  amountPaid: string;
  balanceDue: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletionReason: string | null;
  customer?: Customer;
  items?: SaleItem[];
  payments?: Payment[];
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
  processedById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletionReason: string | null;
  customer?: Customer;
  sale?: Sale | null;
  processedBy?: { id: string; name: string } | null;
  items?: ReturnItem[];
}

export interface ReturnEligibleItem {
  productId: string;
  itemName: string;
  rate: number;
  gstPercent: number;
  quantitySold: number;
  quantityReturned: number;
  quantityEligible: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  customerId: string;
  saleId: string | null;
  date: string;
  amount: string;
  mode: PaymentMode;
  accountType: LedgerAccountType;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletionReason: string | null;
  customer?: Customer;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string | null;
  mobile: string | null;
  address: string | null;
  gstNumber: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletionReason: string | null;
}

export interface StockBatch {
  id: string;
  productId: string;
  purchasePrice: string;
  quantity: string;
  quantityRemaining: string;
  purchaseDate: string;
  supplier: string | null;
  supplierId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletionReason: string | null;
  product?: Product;
  supplierRef?: Supplier | null;
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

export type PeriodPreset = "today" | "week" | "month" | "year" | "custom";

export interface DashboardPeriodSummary {
  from: string;
  to: string;
  sales: number;
  payments: number;
  returns: number;
  cashSales: number;
  billSales: number;
  grossProfit: number;
  profitPercent: number;
  totalInvoices: number;
}

export interface ProfitReportData {
  totalSales: number;
  totalCOGS: number;
  grossProfit: number;
  profitPercent: number;
  totalInvoices: number;
  totalProductsSold: number;
  cashSales: number;
  billSales: number;
  paidAmount: number;
  outstandingAmount: number;
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

// ==========================================================
// HR / PAYROLL
// ==========================================================

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  mobile: string;
  address: string | null;
  email: string | null;
  dateOfJoining: string;
  department: string | null;
  designation: string | null;
  salaryType: SalaryType;
  currentSalary: string;
  employmentStatus: EmploymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryIncrement {
  id: string;
  employeeId: string;
  previousSalary: string;
  newSalary: string;
  effectiveDate: string;
  reason: string | null;
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  salaryRecordId: string;
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMode;
  remarks: string | null;
  recordedById: string;
  recordedBy?: { name: string };
  createdAt: string;
  deletedAt: string | null;
  deletionReason: string | null;
}

export interface SalaryRecord {
  id: string;
  salaryNumber: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: string;
  paidLeaveDays: string;
  unpaidLeaveDays: string;
  leaveDeduction: string;
  advanceDeduction: string;
  grossSalary: string;
  netPay: string;
  amountPaid: string;
  balanceDue: string;
  paymentStatus: SalaryPaymentStatus;
  paymentDate: string | null;
  paymentMethod: PaymentMode | null;
  notes: string | null;
  createdAt: string;
  deletedAt: string | null;
  deletionReason: string | null;
  employee?: Employee;
  payments?: SalaryPayment[];
}

export interface AdvancePayment {
  id: string;
  advanceNumber: string;
  employeeId: string;
  date: string;
  amount: string;
  reason: string | null;
  adjustedAmount: string;
  status: AdvanceStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletionReason: string | null;
}

export interface AdvanceAdjustment {
  id: string;
  advanceId: string;
  salaryRecordId: string;
  employeeId: string;
  amount: string;
  remainingBalanceAfter: string;
  adjustmentDate: string;
  processedById: string;
  createdAt: string;
  employee?: Employee;
  advance?: AdvancePayment;
  salaryRecord?: SalaryRecord;
}

export interface AdvancePendingSummary {
  totalPending: number;
  advances: AdvancePayment[];
}

export interface AdvancePendingRow {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  totalPending: number;
  count: number;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  totalDays: string;
  reason: string | null;
  recordedById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletionReason: string | null;
  employee?: Employee;
}
