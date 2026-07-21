import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Circle,
  Home,
  LogOut,
  Menu,
  Package,
  Shield,
  Settings,
  ShoppingCart,
  Wallet,
  Truck,
  Users,
} from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogoutModal } from "@/components/LogoutModal";
import { useAppDispatch } from "@/app/hooks";
import { logout, useGetProfileQuery } from "@/features/auth";
import { connectSocket } from "@/utils/socket";
import { cn } from "@/utils/utils";

type MenuItem = { to: string; label: string; icon: typeof Home };

const vendorNav: MenuItem[] = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: Home },
  { to: "/vendor/products", label: "Products", icon: Package },
  { to: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { to: "/vendor/delivery-requests", label: "Delivery requests", icon: Truck },
  { to: "/vendor/earnings", label: "Earnings & Payouts", icon: Wallet },
  { to: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/vendor/customers", label: "Customer management", icon: Users },
  { to: "/vendor/controllers", label: "Controller management", icon: Shield },
];

export function VendorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isError } = useGetProfileQuery();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    connectSocket();
  }, []);

  const settingsActive = location.pathname.startsWith("/vendor/settings");

  useEffect(() => {
    if (settingsActive) setOpenSettings(true);
  }, [settingsActive]);

  function handleLogout() {
    localStorage.removeItem("token");
    dispatch(logout());
    void navigate("/auth/login", { replace: true });
  }

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-gray-50 to-gray-100 text-foreground">
      <div className="flex w-full min-h-svh">
        {mobileOpen ? (
          <button
            type="button"
            className="bg-background/50 fixed inset-0 z-30 md:hidden"
            aria-label="Close"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
        <aside
          className={cn(
            "z-40 flex w-64 shrink-0 flex-col border-r border-gray-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 transition max-md:fixed max-md:top-0 max-md:bottom-0 max-md:left-0",
            "md:sticky md:top-0 md:h-svh",
            !mobileOpen && "max-md:-translate-x-full max-md:shadow-none",
            mobileOpen && "max-md:translate-x-0",
          )}
        >
          <div className="border-b px-4 py-4">
            <Link
              to="/vendor/dashboard"
              className="flex items-center gap-2 font-semibold text-primary"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                W
              </span>
              <span>Unified vendor</span>
            </Link>
            {isError && (
              <p className="text-muted-foreground mt-1 text-xs">
                Set auth token in Settings to load your profile.
              </p>
            )}
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <LayoutGroup>
                <nav className="flex flex-col gap-1 px-2 py-2">
                  {vendorNav.map((item) => {
                    if (item.to !== "/vendor/controllers") {
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "text-primary"
                                : "text-gray-600 hover:bg-white/70 hover:text-gray-900",
                            )
                          }
                          onClick={() => setMobileOpen(false)}
                        >
                          {({ isActive }) => (
                            <>
                              {isActive ? (
                                <motion.span
                                  layoutId="vendor-active-pill"
                                  className="absolute inset-0 rounded-xl bg-primary/10 ring-1 ring-primary/20"
                                  transition={{
                                    type: "spring",
                                    stiffness: 520,
                                    damping: 42,
                                  }}
                                />
                              ) : null}
                              <span className="relative flex items-center gap-2">
                                <item.icon className="size-4" />
                                {item.label}
                              </span>
                            </>
                          )}
                        </NavLink>
                      );
                    }

                    return (
                      <div key={item.to} className="space-y-1">
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "text-primary"
                                : "text-gray-600 hover:bg-white/70 hover:text-gray-900",
                            )
                          }
                          onClick={() => setMobileOpen(false)}
                        >
                          {({ isActive }) => (
                            <>
                              {isActive ? (
                                <motion.span
                                  layoutId="vendor-active-pill"
                                  className="absolute inset-0 rounded-xl bg-primary/10 ring-1 ring-primary/20"
                                  transition={{
                                    type: "spring",
                                    stiffness: 520,
                                    damping: 42,
                                  }}
                                />
                              ) : null}
                              <span className="relative flex items-center gap-2">
                                <item.icon className="size-4" />
                                {item.label}
                              </span>
                            </>
                          )}
                        </NavLink>

                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                            settingsActive
                              ? "bg-primary/10 text-primary"
                              : "text-gray-600 hover:bg-white/70 hover:text-gray-900",
                          )}
                          onClick={() => setOpenSettings((v) => !v)}
                        >
                          <span className="flex items-center gap-2">
                            <Settings className="size-4" />
                            Settings
                          </span>
                          {openSettings ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </button>

                        <div
                          className={cn(
                            "overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
                            openSettings
                              ? "max-h-40 opacity-100"
                              : "max-h-0 opacity-0",
                          )}
                        >
                          <div className="flex flex-col gap-0.5 py-1">
                            {[
                              {
                                to: "/vendor/settings/profile",
                                label: "Profile",
                              },
                              {
                                to: "/vendor/settings/security",
                                label: "Security",
                              },
                              { to: "/vendor/settings/legal", label: "Legal" },
                              {
                                to: "/vendor/settings/support",
                                label: "Support",
                              },
                            ].map((c) => (
                              <NavLink
                                key={c.to}
                                to={c.to}
                                className={({ isActive }) =>
                                  cn(
                                    "relative flex items-center gap-2 rounded-xl py-1.5 text-xs font-medium transition-colors",
                                    "pl-8 pr-3",
                                    isActive
                                      ? "text-primary"
                                      : "text-gray-600 hover:bg-white/70 hover:text-gray-900",
                                  )
                                }
                                onClick={() => setMobileOpen(false)}
                              >
                                {({ isActive }) => (
                                  <>
                                    {isActive ? (
                                      <motion.span
                                        layoutId="vendor-active-subpill"
                                        className="absolute inset-0 rounded-xl bg-primary/10 ring-1 ring-primary/20"
                                        transition={{
                                          type: "spring",
                                          stiffness: 520,
                                          damping: 42,
                                        }}
                                      />
                                    ) : null}
                                    <span className="relative flex items-center gap-2">
                                      <Circle className="size-2 fill-current opacity-70" />
                                      {c.label}
                                    </span>
                                  </>
                                )}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </nav>
              </LayoutGroup>
            </div>

            <div className="border-t p-2">
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl py-2 text-sm font-medium transition-colors",
                  "px-3",
                  "text-rose-600 hover:bg-rose-50 cursor-pointer",
                )}
                onClick={() => {
                  setShowLogoutModal(true);
                  setMobileOpen(false);
                }}
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-14 items-center gap-2 px-4">
              <Button
                className="md:hidden"
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
              <h1 className="text-foreground min-w-0 flex-1 truncate text-base font-semibold md:text-lg">
                Dashboard
              </h1>
            </div>
          </header>
          <main className="min-h-[calc(100svh-3.5rem)] w-full flex-1 px-6 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      <LogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          handleLogout();
        }}
      />
    </div>
  );
}
