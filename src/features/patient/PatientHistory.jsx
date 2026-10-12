import { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { patientsService, appointmentsService, doctorsService } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'

export default function PatientHistory() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseActive) {
      setLoading(false)
      return
    }

    let active = true
    const load = async () => {
      const patient = await patientsService.getByEmail(user?.email)
      if (!patient || !active) {
        if (active) setLoading(false)
        return
      }
      const [apts, docs] = await Promise.all([
        appointmentsService.getByPatient(patient.id),
        doctorsService.getAll(),
      ])
      if (!active) return
      setAppointments(apts)
      setDoctors(docs)
      setLoading(false)
    }
    load()

    const unsub = doctorsService.subscribe(() => load())
    return () => {
      active = false
      unsub()
    }
  }, [user?.email])

  const docById = (id) => doctors.find(d => d.id === id)

  if (!isSupabaseActive) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Appointment History</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-700">
          🎭 Demo mode — your appointment history needs a database connection.
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Appointment History</h1>
        <p className="text-gray-500">Loading…</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Appointment History</h1>
      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments yet. Book one to see your history here.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const doc = docById(apt.doctor_id)
            const status = apt.status === 'completed' ? 'completed' : apt.payment_status === 'paid' ? 'paid' : 'booked'
            return (
              <div key={apt.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{doc?.name || 'Doctor'}</p>
                  <p className="text-gray-500 text-sm">{doc?.specialty} · {apt.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${apt.fee ?? 0}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    status === 'completed' ? 'bg-green-100 text-green-700' :
                    status === 'paid' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
