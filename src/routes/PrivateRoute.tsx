import type { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export function PrivateRoute({ children }: { children?: ReactNode }) {
  useAppSelector((s) => s.auth.token);
  useLocation();
  return children ? <>{children}</> : <Outlet />;
}
