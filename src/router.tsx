import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageLoader } from "@/components/PageLoader";

const LoginPage = lazy(() => import("@/pages/Login/LoginPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFound/NotFoundPage"));
const DashboardPage = lazy(() => import("@/pages/Dashboard/DashboardPage"));
const CustomersPage = lazy(() => import("@/pages/Customers/CustomersPage"));
const CustomerFormPage = lazy(() => import("@/pages/Customers/CustomerFormPage"));
const CustomerDetailPage = lazy(() => import("@/pages/Customers/CustomerDetailPage"));
const ProductsPage = lazy(() => import("@/pages/Products/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/pages/Products/ProductDetailPage"));
const SuppliersPage = lazy(() => import("@/pages/Suppliers/SuppliersPage"));
const PurchasesPage = lazy(() => import("@/pages/Purchases/PurchasesPage"));
const SalesPage = lazy(() => import("@/pages/Sales/SalesPage"));
const SaleFormPage = lazy(() => import("@/pages/Sales/SaleFormPage"));
const SaleDetailPage = lazy(() => import("@/pages/Sales/SaleDetailPage"));
const ReturnsPage = lazy(() => import("@/pages/Returns/ReturnsPage"));
const ReturnFormPage = lazy(() => import("@/pages/Returns/ReturnFormPage"));
const ReturnDetailPage = lazy(() => import("@/pages/Returns/ReturnDetailPage"));
const PaymentsPage = lazy(() => import("@/pages/Payments/PaymentsPage"));
const LedgerPage = lazy(() => import("@/pages/Ledger/LedgerPage"));
const EmployeesPage = lazy(() => import("@/pages/Employees/EmployeesPage"));
const EmployeeFormPage = lazy(() => import("@/pages/Employees/EmployeeFormPage"));
const EmployeeDetailPage = lazy(() => import("@/pages/Employees/EmployeeDetailPage"));
const ReportsPage = lazy(() => import("@/pages/Reports/ReportsPage"));
const SettingsPage = lazy(() => import("@/pages/Settings/SettingsPage"));

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: withSuspense(<LoginPage />) }],
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: "customers", element: withSuspense(<CustomersPage />) },
      { path: "customers/new", element: withSuspense(<CustomerFormPage />) },
      { path: "customers/:id/edit", element: withSuspense(<CustomerFormPage />) },
      { path: "customers/:id", element: withSuspense(<CustomerDetailPage />) },
      { path: "products", element: withSuspense(<ProductsPage />) },
      { path: "products/:id", element: withSuspense(<ProductDetailPage />) },
      { path: "suppliers", element: withSuspense(<SuppliersPage />) },
      { path: "purchases", element: withSuspense(<PurchasesPage />) },
      { path: "sales", element: withSuspense(<SalesPage />) },
      { path: "sales/new", element: withSuspense(<SaleFormPage />) },
      { path: "sales/:id/edit", element: withSuspense(<SaleFormPage />) },
      { path: "sales/:id", element: withSuspense(<SaleDetailPage />) },
      { path: "returns", element: withSuspense(<ReturnsPage />) },
      { path: "returns/new", element: withSuspense(<ReturnFormPage />) },
      { path: "returns/:id/edit", element: withSuspense(<ReturnFormPage />) },
      { path: "returns/:id", element: withSuspense(<ReturnDetailPage />) },
      { path: "payments", element: withSuspense(<PaymentsPage />) },
      { path: "ledger", element: withSuspense(<LedgerPage />) },
      { path: "employees", element: withSuspense(<EmployeesPage />) },
      { path: "employees/new", element: withSuspense(<EmployeeFormPage />) },
      { path: "employees/:id/edit", element: withSuspense(<EmployeeFormPage />) },
      { path: "employees/:id", element: withSuspense(<EmployeeDetailPage />) },
      { path: "reports", element: withSuspense(<ReportsPage />) },
      { path: "settings", element: withSuspense(<SettingsPage />) },
    ],
  },
  { path: "*", element: withSuspense(<NotFoundPage />) },
]);

export const AppRouter = () => <RouterProvider router={router} />;
