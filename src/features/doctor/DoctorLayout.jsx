import { useState, useEffect, createContext, useContext } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { doctorsService } from '../../services/supabase'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { isSupabaseActive } from '../../supabase'

const DoctorContext = createContext(null)
export const useDoctor = () => useContext(DoctorContext)

export default function DoctorLayout() {
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')

  useEffect(() => {
    if (!isSupabaseActive) {
      setDoctors(TEST_DOCTORS)
      setDoctorId(prev => prev || TEST_DOCTORS[0]?.id || '')
      return undefined
    }
    const unsubscribe = doctorsService.subscribe((docs) => {
      const sorted = [...docs].sort((a, b) => a.id.localeCompare(b.id))
      setDoctors(sorted)
      setDoctorId(prev => prev && sorted.some(d => d.id === prev) ? prev : sorted[0]?.id || '')
    })
    return unsubscribe
  }, [])

  const doctor = doctors.find(d => d.id === doctorId)

  return (
    <DoctorContext.Provider value={{ doctors, doctor, doctorId, setDoctorId, isDemo: !isSupabaseActive }}>
      <div className="flex min-h-screen">
        <nav className="w-64 bg-gray-800 text-white p-4 flex flex-col gap-4">
          <h2 className="font-bold text-lg">Doctor Panel</h2>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Viewing as</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              {doctors.length === 0 && <option value="">No doctors</option>}
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
              ))}
            </select>
          </div>
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
