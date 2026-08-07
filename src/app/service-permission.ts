import type {
  ServiceControllerPermission,
  ServiceControllerRecord,
} from "@/features/controllers";

export const SERVICE_CONTROLLERS_LS_KEY =
  "service_controller_management:list:v1";
export const SERVICE_CONTROLLER_SESSION_LS_KEY =
  "service_controller_session:permissions:v1";

export function loadServiceControllers(): ServiceControllerRecord[] {
  try {
    const raw = localStorage.getItem(SERVICE_CONTROLLERS_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as ServiceControllerRecord[];
  } catch {
    return [];
  }
}

export function setActiveServiceControllerPermissions(
  perms: ServiceControllerPermission[],
) {
  try {
    localStorage.setItem(
      SERVICE_CONTROLLER_SESSION_LS_KEY,
      JSON.stringify(perms),
    );
  } catch {
    // ignore
  }
}

export function getActiveServiceControllerPermissions():
  | ServiceControllerPermission[]
  | null {
  try {
    const raw = localStorage.getItem(SERVICE_CONTROLLER_SESSION_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.map((x) => String(x)) as ServiceControllerPermission[];
  } catch {
    return null;
  }
}
