import { useState, useEffect } from 'react'
import { useDoctor } from './DoctorLayout'
import { consultNotesService, appointmentsService, patientsService } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'

export default function DoctorHistory() {
  const { doctor, doctorId, isDemo } = useDoctor()
  const [notes, setNotes] = useState([])
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(!isDemo)

  useEffect(() => {
    if (isDemo || !doctorId) {
      setLoading(false)
      return undefined
    }
    setLoading(true)
    let cancelled = false
    ;(async () => {
      const [n, a, p] = await Promise.all([
        consultNotesService.getByDoctor(doctorId),
        appointmentsService.getByDoctor(doctorId),
        patientsService.getAll(),
      ])
      if (cancelled) return
      setNotes(n)
      setAppointments(a)
      setPatients(p)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [isDemo, doctorId])

  const patientName = (id) => patients.find(p => p.id === id)?.name || (id ? `#${id}` : '—')
  const fmt = (ts) => (ts ? new Date(ts).toLocaleString() : '—')

  return (
    <div>
      {isDemo && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-700">
          🎭 Demo mode — database not connected. History is unavailable offline.
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Consultation History — {doctor?.name || ''}</h1>

      {loading && <p className="text-gray-500">Loading history…</p>}

      {!loading && (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Consult Notes ({notes.length})</h2>
            {notes.length === 0 ? (
              <p className="text-gray-500">No consult notes yet for this doctor.</p>
            ) : (
              <div className="space-y-3">
                {notes.map(n => (
                  <div key={n.id} className="bg-white shadow rounded p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">
                        Token #{n.token || '—'} · <StatusBadge status={n.consult_status} />
                      </span>
                      <span className="text-xs text-gray-500">{fmt(n.completed_at || n.created_at)}</span>
                    </div>
                    {n.diagnosis && <p className="text-sm"><strong>Diagnosis:</strong> {n.diagnosis}</p>}
                    {n.notes && <p className="text-sm text-gray-600 mt-1">{n.notes}</p>}
                    {n.follow_up && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">
                        Follow-up required
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Appointments ({appointments.length})</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments for this doctor yet.</p>
            ) : (
              <table className="w-full border-collapse bg-white shadow rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Patient</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id} className="border-t">
                      <td className="p-3">{patientName(a.patient_id)}</td>
                      <td className="p-3">{a.date || '—'}</td>
                      <td className="p-3"><StatusBadge status={a.status} /></td>
                      <td className="p-3">{a.payment_status || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-gray-100 text-gray-800',
    booked: 'bg-blue-100 text-blue-800',
    pending: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rescheduled: 'bg-orange-100 text-orange-800',
    referral: 'bg-purple-100 text-purple-800',
  }
  return (
    <span className={`px-2 py-1 rounded text-xs ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status || 'unknown'}
    </span>
  )
}
