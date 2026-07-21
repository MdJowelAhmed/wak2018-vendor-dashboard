import type { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export function PrivateRoute({ children }: { children?: ReactNode }) {
  // Demo-first: allow navigation without a backend/token.
  // Login still works for role switching, but it's not required to use the dashboard.
  useAppSelector((s) => s.auth.token);
  useLocation();
  return children ? <>{children}</> : <Outlet />;
}
