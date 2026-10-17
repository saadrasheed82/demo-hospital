import { useState, useEffect, createContext, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { doctorsService } from '../../services/supabase'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { isSupabaseActive } from '../../supabase'
import { useAuth } from '../../auth/AuthContext'
import { AppShell, Notice } from '../../components/ui'

const DoctorContext = createContext(null)
export const useDoctor = () => useContext(DoctorContext)

const NAV = [
  { to: '/doctor', label: "Today's queue", end: true },
  { to: '/doctor/history', label: 'History' },
]

export default function DoctorLayout() {
  const { user } = useAuth()
  const loginEmail = user?.email ? String(user.email).toLowerCase() : ''

  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')

  useEffect(() => {
    if (!isSupabaseActive) {
      setDoctors(TEST_DOCTORS)
      setDoctorId(TEST_DOCTORS[0]?.id || '')
      return undefined
    }
    // A doctor login is tied to the doctors row with the same email. That row is
    // created (or claimed) by the admin on Team Logins, so this lookup is exact.
    const unsubscribe = doctorsService.subscribe((docs) => {
      const mine = docs.filter(d => (d.email || '').toLowerCase() === loginEmail)
      setDoctors(mine)
      setDoctorId(mine[0]?.id || '')
    })
    return unsubscribe
  }, [loginEmail])

  const doctor = doctors.find(d => d.id === doctorId)

  const aside = doctor ? (
    <div className="panel--quiet panel border-0 bg-transparent px-0 py-0">
      <p className="label-mono">On duty</p>
      <p className="mt-3xs truncate text-sm font-medium text-ink">{doctor.name}</p>
      <p className="truncate text-xs text-ink-3">
        {doctor.specialty}
        {doctor.room ? ` · Room ${doctor.room}` : ''}
      </p>
    </div>
  ) : (
    <Notice tone="warn" title="No doctor record linked to this login">
      Ask an administrator to claim the doctor on Team logins.
    </Notice>
  )

  return (
    <DoctorContext.Provider value={{ doctor, doctorId, isDemo: !isSupabaseActive }}>
      <AppShell workspace="Clinician desk" role="Doctor" nav={NAV} aside={aside}>
        <Outlet />
      </AppShell>
    </DoctorContext.Provider>
  )
}