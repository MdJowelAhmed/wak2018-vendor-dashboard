import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import type { UserRole } from '@/features/auth/types/authTypes';

type AppRole = UserRole

const roleHome: Record<AppRole, string> = {
  vendor: '/vendor/dashboard',
  service: '/service/dashboard',
}

export function RequireRole({ role }: { role: AppRole }) {
  const loc = useLocation()
  const user = useAppSelector((s) => s.auth.user)
  const urlRole = (new URLSearchParams(loc.search).get('role') as AppRole | null) ?? null

  const actualRole = (user?.role as AppRole | undefined) ?? (urlRole ?? undefined)

  const ok = actualRole === role
  if (!ok) {
    if (actualRole && roleHome[actualRole]) {
      return <Navigate to={roleHome[actualRole]} replace />
    }
    return <Navigate to="/auth/login" replace />
  }
  return <Outlet />
}

