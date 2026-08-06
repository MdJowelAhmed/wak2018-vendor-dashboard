import { useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { useGetUserProfileQuery } from '@/services/profileApi';
import { ProfileSettings } from '@/features/settings/components/ProfileSettings'
import { SecuritySettings } from '@/features/settings/components/SecuritySettings'
import { LegalSettings } from '@/features/settings/components/LegalSettings'
import { SupportSettings } from '@/features/settings/components/SupportSettings'

export function SettingsPage() {
  const location = useLocation()
  const sessionUser = useAppSelector((s) => s.auth.user)
  const { data: profileResponse } = useGetUserProfileQuery()
  const profileData = profileResponse?.data

  const p = location.pathname
  const section = p.endsWith('/security')
    ? 'security'
    : p.endsWith('/legal')
      ? 'legal'
      : p.endsWith('/support')
        ? 'support'
        : 'profile'

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">Profile, security, legal documents, and support.</p>
        </div>
      </div>
      {sessionUser && (
        <p className="text-muted-foreground text-sm">
          Signed in as {sessionUser.email} · role: {sessionUser.role}
        </p>
      )}

      {section === 'profile' ? <ProfileSettings profile={profileData} /> : null}
      {section === 'security' ? <SecuritySettings /> : null}
      {section === 'legal' ? <LegalSettings /> : null}
      {section === 'support' ? <SupportSettings /> : null}
    </div>
  )
}
