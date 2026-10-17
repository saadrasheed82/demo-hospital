import { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { patientsService, appointmentsService, doctorsService } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'
import { EmptyState, Notice, PageHeader, Panel, SkeletonRows, StatusChip } from '../../components/ui'

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

  const header = (
    <PageHeader
      eyebrow="Patient portal"
      title="Appointment history"
      meta="Every visit you have booked, with its payment and consult status."
    />
  )

  if (!isSupabaseActive) {
    return (
      <div>
        {header}
        <Notice tone="warn" title="Demo mode">
          Appointment history needs a database connection.
        </Notice>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        {header}
        <Panel title="Your appointments">
          <SkeletonRows rows={4} />
        </Panel>
      </div>
    )
  }

  return (
    <div>
      {header}

      {appointments.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No appointments yet"
            hint="Book a doctor from the Find a doctor page and your visit will be listed here."
          />
        </div>
      ) : (
        <Panel title="Your appointments" meta={`${appointments.length} ${appointments.length === 1 ? 'visit' : 'visits'}`} flush>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => {
                  const doc = docById(apt.doctor_id)
                  const tone =
                    apt.status === 'completed' ? 'ok' : apt.payment_status === 'paid' ? 'active' : 'neutral'
                  const label =
                    apt.status === 'completed' ? 'Completed' : apt.payment_status === 'paid' ? 'Paid' : 'Booked'
                  return (
                    <tr key={apt.id}>
                      <td className="cell-strong">{doc?.name || '—'}</td>
                      <td>{doc?.specialty || '—'}</td>
                      <td className="font-mono text-xs">{apt.date || '—'}</td>
                      <td className="tnum">${apt.fee ?? 0}</td>
                      <td>
                        <StatusChip tone={tone}>{label}</StatusChip>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  )
}