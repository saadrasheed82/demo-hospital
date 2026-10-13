import { useState, useEffect, createContext, useContext } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { doctorsService } from '../../services/supabase'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { isSupabaseActive } from '../../supabase'
import { useAuth } from '../../auth/AuthContext'

const DoctorContext = createContext(null)
export const useDoctor = () => useContext(DoctorContext)

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

  return (
    <DoctorContext.Provider value={{ doctor, doctorId, isDemo: !isSupabaseActive }}>
      <div className="flex min-h-screen">
        <nav className="w-64 bg-gray-800 text-white p-4 flex flex-col gap-4">
          <h2 className="font-bold text-lg">Doctor Panel</h2>
          {doctor ? (
            <div className="text-sm bg-gray-700 rounded p-2">
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-gray-300 text-xs">{doctor.specialty}</p>
            </div>
          ) : (
            <div className="text-sm bg-amber-700 rounded p-2">
              <p className="font-semibold">No doctor record linked to this login</p>
              <p className="text-gray-100 text-xs">Ask an admin to claim the doctor on Team Logins.</p>
            </div>
          )}
          <NavLink
            to="/doctor"
            className="block py-2 px-2 hover:bg-gray-700 rounded"
          >
            My Queue
          </NavLink>
          <NavLink
            to="/doctor/history"
            className="block py-2 px-2 hover:bg-gray-700 rounded"
          >
            History
          </NavLink>
        </nav>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </DoctorContext.Provider>
  )
}
