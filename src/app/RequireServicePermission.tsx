import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { getActiveServiceControllerPermissions } from "@/app/service-permission";
import type { ServiceControllerPermission } from "@/features/controllers";

const defaultHome = "/service/dashboard";

export function RequireServicePermission({
  permission,
  children,
}: {
  permission: ServiceControllerPermission;
  children: ReactNode;
}) {
  const loc = useLocation();
  const perms = getActiveServiceControllerPermissions();
  if (!perms) return <>{children}</>;

  const ok = perms.includes(permission);
  if (!ok) {
    return <Navigate to={defaultHome} replace state={{ from: loc.pathname }} />;
  }
  return <>{children}</>;
}
