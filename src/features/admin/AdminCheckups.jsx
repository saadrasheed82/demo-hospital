import { useState, useEffect, Fragment } from 'react'
import { appointmentsService, doctorsService, patientsService, tokensService, consultNotesService } from '../../services/supabase'
import { resolveAppointmentCheckup } from '../../shared/utils/checkup'
import { CheckupDetail } from '../../components/CheckupDetail'
import { Button, EmptyState, Notice, PageHeader, Panel, PaymentChip, SkeletonRows, StatusChip } from '../../components/ui'

/* Every checkup in the hospital, read-only. Admins see who ran the visit, who
 * attended and how long it took — the clinical notes stay between the doctor and
 * the patient, so this page renders CheckupDetail with showNotes={false}.
 */
export default function AdminCheckups() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [tokens, setTokens] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [apts, docs, pats, toks, nts] = await Promise.all([
          appointmentsService.getAll(),
          doctorsService.getAll(),
          patientsService.getAll(),
          tokensService.getAll(),
          consultNotesService.getAll(),
        ])
        if (!active) return
        setAppointments(apts)
        setDoctors(docs)
        setPatients(pats)
        setTokens(toks)
        setNotes(nts)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const header = (
    <PageHeader
      eyebrow="Administration"
      title="Checkups"
      meta="Every visit on record: the doctor, the patient and the timing. Clinical notes are visible to the doctor and the patient only."
    />
  )

  if (loading) {
    return (
      <div>
        {header}
        <Panel title="All checkups">
          <SkeletonRows rows={5} />
        </Panel>
      </div>
    )
  }

  return (
    <div>
      {header}

      {error && (
        <div className="mb-md">
          <Notice tone="danger" title="Could not load checkups">{error}</Notice>
        </div>
      )}

      <Panel
        title="All checkups"
        meta={`${appointments.length} ${appointments.length === 1 ? 'visit' : 'visits'}`}
        flush
      >
        {appointments.length === 0 ? (
          <EmptyState
            title="No checkups recorded"
            hint="Visits appear here as soon as a patient books a doctor."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th className="text-right">Checkup</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => {
                  const checkup = resolveAppointmentCheckup(apt, { tokens, notes, doctors, patients })
                  const open = expandedId === apt.id
                  return (
                    <Fragment key={apt.id}>
                      <tr>
                        <td className="token-id">{checkup.tokenNumber ? `#${checkup.tokenNumber}` : '—'}</td>
                        <td className="cell-strong">{checkup.patient?.name || '—'}</td>
                        <td>
                          {checkup.doctor?.name || '—'}
                          {checkup.doctor?.specialty && (
                            <span className="block text-xs text-ink-3">{checkup.doctor.specialty}</span>
                          )}
                        </td>
                        <td className="font-mono text-xs">{apt.date || '—'}</td>
                        <td>
                          <PaymentChip status={apt.payment_status} />
                        </td>
                        <td className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            aria-expanded={open}
                            onClick={() => setExpandedId(open ? null : apt.id)}
                          >
                            {open ? 'Hide' : 'View timing'}
                          </Button>
                        </td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={6} className="bg-paper-2">
                            <CheckupDetail checkup={checkup} showNotes={false} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
