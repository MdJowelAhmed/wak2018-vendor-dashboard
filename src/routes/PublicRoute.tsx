import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export function PublicRoute({ children }: { children?: ReactNode }) {
  useAppSelector((s) => s.auth.token);
  return children ? <>{children}</> : <Outlet />;
}
