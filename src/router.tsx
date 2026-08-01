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
const SalesPage = lazy(() => import("@/pages/Sales/SalesPage"));
const SaleFormPage = lazy(() => import("@/pages/Sales/SaleFormPage"));
const SaleDetailPage = lazy(() => import("@/pages/Sales/SaleDetailPage"));
const ReturnsPage = lazy(() => import("@/pages/Returns/ReturnsPage"));
const ReturnFormPage = lazy(() => import("@/pages/Returns/ReturnFormPage"));
const PaymentsPage = lazy(() => import("@/pages/Payments/PaymentsPage"));
const LedgerPage = lazy(() => import("@/pages/Ledger/LedgerPage"));
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
      { path: "sales", element: withSuspense(<SalesPage />) },
      { path: "sales/new", element: withSuspense(<SaleFormPage />) },
      { path: "sales/:id", element: withSuspense(<SaleDetailPage />) },
      { path: "returns", element: withSuspense(<ReturnsPage />) },
      { path: "returns/new", element: withSuspense(<ReturnFormPage />) },
      { path: "payments", element: withSuspense(<PaymentsPage />) },
      { path: "ledger", element: withSuspense(<LedgerPage />) },
      { path: "reports", element: withSuspense(<ReportsPage />) },
      { path: "settings", element: withSuspense(<SettingsPage />) },
    ],
  },
  { path: "*", element: withSuspense(<NotFoundPage />) },
]);

export const AppRouter = () => <RouterProvider router={router} />;
