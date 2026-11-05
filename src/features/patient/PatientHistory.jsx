import { useState, useEffect, Fragment } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { patientsService, appointmentsService, doctorsService, tokensService, consultNotesService } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'
import { resolveAppointmentCheckup } from '../../shared/utils/checkup'
import { CheckupDetail } from '../../components/CheckupDetail'
import { Button, EmptyState, Notice, PageHeader, Panel, SkeletonRows, StatusChip } from '../../components/ui'

export default function PatientHistory() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [tokens, setTokens] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

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
      const [apts, docs, pats, toks, nts] = await Promise.all([
        appointmentsService.getByPatient(patient.id),
        doctorsService.getAll(),
        patientsService.getAll(),
        tokensService.getByPatient(patient.id),
        consultNotesService.getByPatient(patient.id),
      ])
      if (!active) return
      setAppointments(apts)
      setDoctors(docs)
      setPatients(pats)
      setTokens(toks)
      setNotes(nts)
      setLoading(false)
    }
    load()

    const unsub = doctorsService.subscribe(() => load())
    return () => {
      active = false
      unsub()
    }
  }, [user?.email])

  const header = (
    <PageHeader
      eyebrow="Patient portal"
      title="Appointment history"
      meta="Every visit you have booked. Open a visit to read your checkup — the doctor, the timing and the notes they filed."
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

  if (appointments.length === 0) {
    return (
      <div>
        {header}
        <div className="panel">
          <EmptyState
            title="No appointments yet"
            hint="Book a doctor from the Find a doctor page and your visit will be listed here."
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      {header}

      <Panel
        title="Your appointments"
        meta={`${appointments.length} ${appointments.length === 1 ? 'visit' : 'visits'}`}
        flush
      >
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Date</th>
                <th>Fee</th>
                <th>Status</th>
                <th className="text-right">Checkup</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => {
                const checkup = resolveAppointmentCheckup(apt, { tokens, notes, doctors, patients })
                const doc = checkup.doctor
                const open = expandedId === apt.id
                const tone =
                  apt.status === 'completed' ? 'ok' : apt.payment_status === 'paid' ? 'active' : 'neutral'
                const label =
                  apt.status === 'completed' ? 'Completed' : apt.payment_status === 'paid' ? 'Paid' : 'Booked'
                return (
                  <Fragment key={apt.id}>
                    <tr>
                      <td className="cell-strong">{doc?.name || '—'}</td>
                      <td>{doc?.specialty || '—'}</td>
                      <td className="font-mono text-xs">{apt.date || '—'}</td>
                      <td className="tnum">Rs {apt.fee ?? 0}</td>
                      <td>
                        <StatusChip tone={tone}>{label}</StatusChip>
                      </td>
                      <td className="text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          aria-expanded={open}
                          onClick={() => setExpandedId(open ? null : apt.id)}
                        >
                          {open ? 'Hide' : checkup.note ? 'View checkup' : 'View details'}
                        </Button>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={6} className="bg-paper-2">
                          <CheckupDetail checkup={checkup} showNotes />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
