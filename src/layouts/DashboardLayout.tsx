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
  Truck,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutModal } from "@/components/LogoutModal";
import { useAppDispatch } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { useGetUserProfileQuery } from "@/services/profileApi";
import { connectSocket } from "@/utils/socket";
import { NotificationDropdown } from "@/features/notifications/components/NotificationDropdown";
import { cn, getImageUrl } from "@/utils/utils";

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
  const { data: profileResponse, isError } = useGetUserProfileQuery();
  const data = profileResponse?.data;
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
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm overflow-hidden">
                {data?.vendor?.logo || data?.profileImage ? (
                  <img
                    src={getImageUrl(data?.vendor?.logo || data?.profileImage)}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (
                    data?.vendor?.businessName?.[0] ||
                    data?.name?.[0] ||
                    "W"
                  ).toUpperCase()
                )}
              </span>
              <span className="truncate w-40">
                {data?.name || data?.vendor?.businessName || "Unified vendor"}
              </span>
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
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* <h1 className="text-foreground truncate text-base font-semibold md:text-lg">
                  Dashboard
                </h1> */}
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200/80 text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1.5"
                >
                  <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                  Vendor Dashboard
                </Badge>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <NotificationDropdown
                  role="vendor"
                  viewAllUrl="/vendor/notifications"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        {(data?.vendor?.logo || data?.profileImage) && (
                          <AvatarImage
                            src={getImageUrl(
                              data?.vendor?.logo || data?.profileImage,
                            )}
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {data?.name?.charAt(0) || <User className="size-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {data?.name || "Vendor"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {data?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/vendor/settings/profile"
                        className="flex items-center cursor-pointer"
                      >
                        <User className="mr-2 size-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/vendor/settings"
                        className="flex items-center cursor-pointer"
                      >
                        <Settings className="mr-2 size-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer flex items-center"
                      onClick={() => setShowLogoutModal(true)}
                    >
                      <LogOut className="mr-2 size-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
