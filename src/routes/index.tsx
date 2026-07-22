import { lazy, Suspense } from "react";
const AuthLayout = lazy(() =>
  import("@/features/auth/components/AuthLayout").then((m) => ({
    default: m.AuthLayout,
  })),
);
const VendorLayout = lazy(() =>
  import("@/layouts/DashboardLayout").then((m) => ({
    default: m.VendorLayout,
  })),
);
const ServiceLayout = lazy(() =>
  import("@/layouts/ServiceLayout").then((m) => ({ default: m.ServiceLayout })),
);
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const VerifyOtpPage = lazy(() =>
  import("@/features/auth/pages/VerifyOtpPage").then((m) => ({
    default: m.VerifyOtpPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import("@/features/dashboard/pages/vendor/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/vendor/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const DeliveryRequestsPage = lazy(() =>
  import("@/features/delivery/pages/DeliveryRequestsPage").then((m) => ({
    default: m.DeliveryRequestsPage,
  })),
);
const DriverQueuePage = lazy(() =>
  import("@/features/delivery/pages/DriverQueuePage").then((m) => ({
    default: m.DriverQueuePage,
  })),
);
const MessagesPage = lazy(() =>
  import("@/features/chat/pages/MessagesPage").then((m) => ({
    default: m.MessagesPage,
  })),
);
const ChatPage = lazy(() =>
  import("@/features/chat/pages/ChatPage").then((m) => ({
    default: m.ChatPage,
  })),
);
const OrdersListPage = lazy(() =>
  import("@/features/orders/pages/OrdersListPage").then((m) => ({
    default: m.OrdersListPage,
  })),
);
const OrderDetailsPage = lazy(() =>
  import("@/features/orders/pages/OrderDetailsPage").then((m) => ({
    default: m.OrderDetailsPage,
  })),
);
const CustomerDetailsPage = lazy(() =>
  import("@/features/customers/pages/vendor/CustomerDetailsPage").then((m) => ({
    default: m.CustomerDetailsPage,
  })),
);
const CustomersManagementPage = lazy(() =>
  import("@/features/customers/pages/vendor/CustomersManagementPage").then(
    (m) => ({ default: m.CustomersManagementPage }),
  ),
);
const ProductFormPage = lazy(() =>
  import("@/features/products/pages/ProductFormPage").then((m) => ({
    default: m.ProductFormPage,
  })),
);
const ProductDetailsPage = lazy(() =>
  import("@/features/products/pages/ProductDetailsPage").then((m) => ({
    default: m.ProductDetailsPage,
  })),
);
const ProductsListPage = lazy(() =>
  import("@/features/products/pages/ProductsListPage").then((m) => ({
    default: m.ProductsListPage,
  })),
);
const ServiceCreatePage = lazy(() =>
  import("@/features/services/pages/vendor/ServiceCreatePage").then((m) => ({
    default: m.ServiceCreatePage,
  })),
);
const ServiceDetailsPage = lazy(() =>
  import("@/features/services/pages/vendor/ServiceDetailsPage").then((m) => ({
    default: m.ServiceDetailsPage,
  })),
);
const ServiceFormPage = lazy(() =>
  import("@/features/services/pages/vendor/ServiceFormPage").then((m) => ({
    default: m.ServiceFormPage,
  })),
);
const ServicesListPage = lazy(() =>
  import("@/features/services/pages/vendor/ServicesListPage").then((m) => ({
    default: m.ServicesListPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings/pages/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const ControllerManagement = lazy(() =>
  import("@/features/settings/pages/ControllerManagement").then((m) => ({
    default: m.ControllerManagement,
  })),
);
const ServiceOnboardingPage = lazy(() =>
  import("@/features/auth/pages/onboarding/service/ServiceOnboardingPage").then(
    (m) => ({ default: m.ServiceOnboardingPage }),
  ),
);
const VendorOnboardingPage = lazy(() =>
  import("@/features/auth/pages/onboarding/vendor/VendorOnboardingPage").then(
    (m) => ({ default: m.VendorOnboardingPage }),
  ),
);
const EarningsPage = lazy(() =>
  import("@/features/dashboard/pages/vendor/EarningsPage").then((m) => ({
    default: m.EarningsPage,
  })),
);
const ServiceDashboardPage = lazy(() =>
  import("@/features/dashboard/pages/service/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const ServiceServicesPage = lazy(() =>
  import("@/features/services/pages/service/ServicesPage").then((m) => ({
    default: m.ServicesPage,
  })),
);
const ServiceBookingsPage = lazy(() =>
  import("@/features/orders/pages/BookingsPage").then((m) => ({
    default: m.BookingsPage,
  })),
);
const ServiceEarningsPage = lazy(() =>
  import("@/features/dashboard/pages/service/EarningsPage").then((m) => ({
    default: m.EarningsPage,
  })),
);
const ServiceSettingsPage = lazy(() =>
  import("@/features/settings/pages/ServiceSettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const AddServicePage = lazy(() =>
  import("@/features/services/pages/service/AddServicePage").then((m) => ({
    default: m.AddServicePage,
  })),
);
const ServiceDetails = lazy(() =>
  import("@/features/services/pages/service/ServiceDetails").then((m) => ({
    default: m.ServiceDetails,
  })),
);
const ServiceAnalyticsPage = lazy(() =>
  import("@/features/dashboard/pages/service/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  })),
);
const ServiceCustomersManagementPage = lazy(() =>
  import("@/features/customers/pages/service/CustomersManagementPage").then(
    (m) => ({ default: m.CustomersManagementPage }),
  ),
);
const ServiceCustomerDetailsPage = lazy(() =>
  import("@/features/customers/pages/service/CustomerDetailsPage").then(
    (m) => ({ default: m.CustomerDetailsPage }),
  ),
);
const ServiceControllerManagementPage = lazy(() =>
  import("@/features/settings/pages/ControllerManagementPage").then((m) => ({
    default: m.ControllerManagementPage,
  })),
);
const ServiceMessagesPage = lazy(() =>
  import("@/features/chat/pages/ServiceMessagesPage").then((m) => ({
    default: m.MessagesPage,
  })),
);

import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { PrivateRoute } from "@/routes/PrivateRoute";
import { PublicRoute } from "@/routes/PublicRoute";
import { RequireRole } from "@/app/role-guard";
import { RequireServicePermission } from "@/app/RequireServicePermission";
import { CustomSpinner } from "@/components/common/CustomSpinner";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <PublicRoute />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "verify-otp", element: <VerifyOtpPage /> },
          { path: "reset-password", element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      { index: true, element: <Navigate to="/service/dashboard" replace /> },
      { path: "onboarding/service", element: <ServiceOnboardingPage /> },
      { path: "onboarding/vendor", element: <VendorOnboardingPage /> },
      {
        element: <VendorLayout />,
        children: [
          {
            element: <RequireRole role="vendor" />,
            children: [
              {
                path: "vendor",
                children: [
                  { index: true, element: <Navigate to="dashboard" replace /> },
                  { path: "dashboard", element: <DashboardPage /> },
                  { path: "products", element: <ProductsListPage /> },
                  {
                    path: "products/create",
                    element: <ProductFormPage mode="create" />,
                  },
                  {
                    path: "products/edit/:id",
                    element: <ProductFormPage mode="edit" />,
                  },
                  {
                    path: "products/:id/edit",
                    element: <ProductFormPage mode="edit" />,
                  },
                  { path: "products/:id", element: <ProductDetailsPage /> },
                  { path: "services", element: <ServicesListPage /> },
                  { path: "services/create", element: <ServiceCreatePage /> },
                  {
                    path: "services/edit/:id",
                    element: <ServiceFormPage mode="edit" />,
                  },
                  { path: "services/:id", element: <ServiceDetailsPage /> },
                  { path: "orders", element: <OrdersListPage /> },
                  { path: "orders/:id", element: <OrderDetailsPage /> },
                  { path: "customers", element: <CustomersManagementPage /> },
                  { path: "customers/:id", element: <CustomerDetailsPage /> },
                  {
                    path: "delivery-requests",
                    element: <DeliveryRequestsPage />,
                  },
                  { path: "earnings", element: <EarningsPage /> },
                  { path: "messages", element: <MessagesPage /> },
                  { path: "chat/:conversationId", element: <ChatPage /> },
                  { path: "analytics", element: <AnalyticsPage /> },
                  { path: "controllers", element: <ControllerManagement /> },
                  { path: "settings", element: <SettingsPage /> },
                  { path: "settings/profile", element: <SettingsPage /> },
                  { path: "settings/security", element: <SettingsPage /> },
                  { path: "settings/legal", element: <SettingsPage /> },
                  { path: "settings/support", element: <SettingsPage /> },
                ],
              },
            ],
          },
          { path: "driver/queue", element: <DriverQueuePage /> },
        ],
      },
      {
        element: <ServiceLayout />,
        children: [
          {
            element: <RequireRole role="service" />,
            children: [
              {
                path: "service",
                children: [
                  { index: true, element: <Navigate to="dashboard" replace /> },
                  {
                    path: "dashboard",
                    element: (
                      <RequireServicePermission permission="dashboard">
                        {<ServiceDashboardPage />}
                      </RequireServicePermission>
                    ),
                  },
                  {
                    path: "services",
                    element: (
                      <RequireServicePermission permission="services">
                        {<ServiceServicesPage />}
                      </RequireServicePermission>
                    ),
                  },
                  { path: "add-service", element: <AddServicePage /> },
                  {
                    path: "bookings",
                    element: (
                      <RequireServicePermission permission="bookings">
                        {<ServiceBookingsPage />}
                      </RequireServicePermission>
                    ),
                  },
                  {
                    path: "analytics",
                    element: (
                      <RequireServicePermission permission="analytics">
                        {<ServiceAnalyticsPage />}
                      </RequireServicePermission>
                    ),
                  },
                  {
                    path: "earnings",
                    element: (
                      <RequireServicePermission permission="earnings">
                        {<ServiceEarningsPage />}
                      </RequireServicePermission>
                    ),
                  },
                  {
                    path: "customers",
                    element: (
                      <RequireServicePermission permission="customers">
                        {<ServiceCustomersManagementPage />}
                      </RequireServicePermission>
                    ),
                  },
                  {
                    path: "customer/:id",
                    element: <ServiceCustomerDetailsPage />,
                  },
                  {
                    path: "controllers",
                    element: <ServiceControllerManagementPage />,
                  },
                  {
                    path: "messages",
                    element: (
                      <RequireServicePermission permission="messages">
                        {<ServiceMessagesPage />}
                      </RequireServicePermission>
                    ),
                  },
                  {
                    path: "settings",
                    element: (
                      <RequireServicePermission permission="settings">
                        <ServiceSettingsPage />
                      </RequireServicePermission>
                    ),
                  },
                  {
                    path: "settings/profile",
                    element: (
                      <RequireServicePermission permission="settings">
                        <ServiceSettingsPage />
                      </RequireServicePermission>
                    ),
                  },
                  {
                    path: "settings/security",
                    element: (
                      <RequireServicePermission permission="settings">
                        <ServiceSettingsPage />
                      </RequireServicePermission>
                    ),
                  },
                  {
                    path: "settings/legal",
                    element: (
                      <RequireServicePermission permission="settings">
                        <ServiceSettingsPage />
                      </RequireServicePermission>
                    ),
                  },
                  {
                    path: "settings/support",
                    element: (
                      <RequireServicePermission permission="settings">
                        <ServiceSettingsPage />
                      </RequireServicePermission>
                    ),
                  },
                  { path: ":id", element: <ServiceDetails /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <div>Page Not Found</div> },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<CustomSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
