import { Outlet } from 'react-router-dom'
import { AppShell } from '../../components/ui'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/doctors', label: 'Doctors' },
  { to: '/admin/staff', label: 'Staff' },
  { to: '/admin/team-logins', label: 'Team logins' },
  { to: '/admin/schedule', label: 'Schedule' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/config', label: 'Config' },
]

export default function AdminLayout() {
  return (
    <AppShell workspace="Administration" role="Admin" nav={NAV}>
      <Outlet />
    </AppShell>
  )
}