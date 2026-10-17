import { useState, useEffect } from 'react'
import { useDoctor } from './DoctorLayout'
import { consultNotesService, appointmentsService, patientsService } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'
import { EmptyState, Notice, PageHeader, Panel, PaymentChip, SkeletonRows, StatusChip } from '../../components/ui'

const CONSULT_LABEL = {
  completed: 'Completed',
  rescheduled: 'Rescheduled',
  referral: 'Referred',
}
const CONSULT_TONE = {
  completed: 'ok',
  rescheduled: 'warn',
  referral: 'active',
}

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
      <PageHeader
        eyebrow="Clinician desk"
        title="Consultation history"
        meta={
          doctor
            ? `Filed notes and appointments for ${doctor.name}.`
            : 'Filed notes and appointments for this login.'
        }
      />

      {isDemo && (
        <div className="mb-md">
          <Notice tone="warn" title="Demo mode">
            History is unavailable without a database connection.
          </Notice>
        </div>
      )}

      {loading ? (
        <Panel title="Consult notes">
          <SkeletonRows rows={4} />
        </Panel>
      ) : (
        <div className="grid gap-md">
          <Panel
            title="Consult notes"
            meta={`${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
            flush
          >
            {notes.length === 0 ? (
              <EmptyState
                title="No consult notes yet"
                hint="Open a patient from today's queue and file notes to build this record."
              />
            ) : (
              <ul className="divide-y divide-rule">
                {notes.map(n => (
                  <li key={n.id} className="panel-body">
                    <div className="flex flex-wrap items-center justify-between gap-2xs">
                      <div className="flex flex-wrap items-center gap-2xs">
                        <span className="token-id">#{n.token || '—'}</span>
                        <StatusChip tone={CONSULT_TONE[n.consult_status] || 'neutral'}>
                          {CONSULT_LABEL[n.consult_status] || n.consult_status || 'Unknown'}
                        </StatusChip>
                        {n.follow_up && <StatusChip tone="warn">Follow-up required</StatusChip>}
                      </div>
                      <span className="font-mono text-xs text-ink-3">
                        {fmt(n.completed_at || n.created_at)}
                      </span>
                    </div>

                    {n.diagnosis && (
                      <p className="mt-2xs text-sm">
                        <span className="label-mono mr-2xs">Diagnosis</span>
                        <span className="font-medium text-ink">{n.diagnosis}</span>
                      </p>
                    )}
                    {n.notes && <p className="mt-2xs text-sm text-ink-2">{n.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Appointments"
            meta={`${appointments.length} ${appointments.length === 1 ? 'visit' : 'visits'}`}
            flush
          >
            {appointments.length === 0 ? (
              <EmptyState title="No appointments yet" hint="Bookings against your login will be listed here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a.id}>
                        <td className="cell-strong">{patientName(a.patient_id)}</td>
                        <td className="font-mono text-xs">{a.date || '—'}</td>
                        <td>
                          <StatusChip tone={a.status === 'completed' ? 'ok' : 'neutral'}>
                            {(a.status || '—').replace(/_/g, ' ')}
                          </StatusChip>
                        </td>
                        <td><PaymentChip status={a.payment_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}