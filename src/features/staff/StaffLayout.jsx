import { Outlet } from 'react-router-dom'
import { AppShell } from '../../components/ui'

const NAV = [
  { to: '/staff/queue', label: 'Live queue' },
  { to: '/staff/book', label: 'Book appointment' },
]

export default function StaffLayout() {
  return (
    <AppShell workspace="Counter desk" role="Staff" nav={NAV}>
      <Outlet />
    </AppShell>
  )
}