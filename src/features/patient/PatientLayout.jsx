import { Outlet } from 'react-router-dom'
import { AppShell } from '../../components/ui'

const NAV = [
  { to: '/patient', label: 'Find a doctor', end: true },
  { to: '/patient/booked', label: 'My queue' },
  { to: '/patient/history', label: 'History' },
]

export default function PatientLayout() {
  return (
    <AppShell workspace="Patient portal" role="Patient" nav={NAV}>
      <Outlet />
    </AppShell>
  )
}