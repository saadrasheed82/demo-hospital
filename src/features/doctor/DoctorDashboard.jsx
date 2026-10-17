import { useState, useEffect } from 'react'
import { useDoctor } from './DoctorLayout'
import { ArrivalToggle } from './ArrivalToggle'
import { NextPatientButton } from './NextPatientButton'
import { ConsultNotes } from './ConsultNotes'
import { tokensService } from '../../services/supabase'
import { Button, EmptyState, Notice, PageHeader, Panel, PaymentChip, SkeletonRows, StatusChip } from '../../components/ui'

const INITIAL_TOKENS = [
  { token: '101', name: 'Sarah Johnson', age: 34, condition: 'Chest pain', paymentStatus: 'paid', status: 'current' },
  { token: '102', name: 'Ali Hassan', age: 45, condition: 'Routine checkup', paymentStatus: 'paid', status: 'pending' },
  { token: '103', name: 'Maria Garcia', age: 28, condition: 'Skin rash', paymentStatus: 'paid', status: 'pending' },
  { token: '104', name: 'Omar Faruk', age: 67, condition: 'Joint pain', paymentStatus: 'paid', status: 'pending' },
  { token: '105', name: 'Layla Ameen', age: 12, condition: 'Fever', paymentStatus: 'unpaid', status: 'pending' },
]

export default function DoctorDashboard() {
  const { doctor, doctorId, isDemo } = useDoctor()
  const [dbTokens, setDbTokens] = useState([])
  const [demoTokens, setDemoTokens] = useState(INITIAL_TOKENS)
  const [loading, setLoading] = useState(!isDemo)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [showNotes, setShowNotes] = useState(null)
  const [arrivalStatus, setArrivalStatus] = useState('arrived')

  useEffect(() => {
    if (isDemo || !doctorId) {
      setLoading(false)
      return undefined
    }
    setLoading(true)
    const unsubscribe = tokensService.subscribe(doctorId, (tokens) => {
      const sorted = [...tokens].sort((a, b) => parseInt(a.token, 10) - parseInt(b.token, 10))
      setDbTokens(sorted)
      setLoading(false)
    })
    return unsubscribe
  }, [isDemo, doctorId])

  const tokens = (isDemo ? demoTokens : dbTokens).map(t => ({
    id: t.id,
    token: t.token,
    name: t.patient_name || t.name,
    age: t.age,
    condition: t.condition,
    paymentStatus: t.payment_status || t.paymentStatus,
    status: t.status,
  }))

  const byTokenNumber = (a, b) => parseInt(a.token, 10) - parseInt(b.token, 10)
  const currentToken = tokens.find(t => t.status === 'current')
  const pendingTokens = tokens.filter(t => t.status === 'pending').sort(byTokenNumber)
  const finishedTokens = tokens.filter(t => !['pending', 'current'].includes(t.status))

  const handleDemoNext = () => {
    const currentIdx = demoTokens.findIndex(t => t.status === 'current')
    if (currentIdx === -1) return
    const updated = demoTokens.map((t, i) =>
      i === currentIdx ? { ...t, status: 'completed', completedAt: new Date().toISOString() } : t
    )
    const nextIdx = updated.findIndex(t => t.status === 'pending')
    if (nextIdx !== -1) updated[nextIdx] = { ...updated[nextIdx], status: 'current' }
    setDemoTokens(updated)
  }

  const handleDbNext = async () => {
    setBusy(true)
    setError(null)
    try {
      const current = dbTokens.find(t => t.status === 'current')
      const next = [...dbTokens].filter(t => t.status === 'pending')
        .sort(byTokenNumber)[0]
      if (current) await tokensService.update(current.id, { status: 'completed' })
      if (next) await tokensService.update(next.id, { status: 'current' })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleNext = isDemo ? handleDemoNext : handleDbNext

  return (
    <div>
      <PageHeader
        eyebrow="Clinician desk"
        title={doctor?.name ? `${doctor.name} — today's queue` : "Today's queue"}
        meta={
          doctor
            ? `${doctor.specialty}${doctor.room ? ` · Room ${doctor.room}` : ''}`
            : 'No doctor record linked to this login.'
        }
        actions={<ArrivalToggle status={arrivalStatus} onStatusChange={setArrivalStatus} />}
      />

      {isDemo && (
        <div className="mb-md">
          <Notice tone="warn" title="Demo mode">
            No database is connected, so a sample queue is shown and changes are not saved.
          </Notice>
        </div>
      )}

      {error && (
        <div className="mb-md">
          <Notice tone="danger" title="Could not update the queue">{error}</Notice>
        </div>
      )}

      {loading ? (
        <Panel title="Today's queue">
          <SkeletonRows rows={5} />
        </Panel>
      ) : (
        <>
          {/* ── the one dark beat: who is in the room now ─────────────── */}
          {currentToken ? (
            <section className={`graphite mb-md p-md lg:p-lg ${arrivalStatus !== 'arrived' ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-md">
                <div className="min-w-0">
                  <p className="label-mono">Currently seeing</p>
                  <p className="mt-2xs font-mono text-4xl font-semibold leading-none tracking-tight lg:text-5xl">
                    #{currentToken.token}
                  </p>
                  <p className="mt-sm font-display text-lg font-semibold">{currentToken.name}</p>
                  <p className="mt-3xs text-sm text-graphite-dim">
                    {[currentToken.condition, currentToken.age != null ? `${currentToken.age} years` : null]
                      .filter(Boolean)
                      .join(' · ') || 'No condition recorded'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2xs">
                  <Button variant="secondary" onClick={() => setShowNotes(currentToken)}>
                    Add consult notes
                  </Button>
                  <NextPatientButton
                    onClick={handleNext}
                    disabled={busy}
                    label={busy ? 'Updating…' : 'Next patient'}
                  />
                </div>
              </div>

              {arrivalStatus !== 'arrived' && (
                <p className="mt-md border-t border-graphite-2 pt-sm text-sm text-graphite-dim">
                  You are marked as {arrivalStatus} — the counter can see this.
                </p>
              )}
            </section>
          ) : (
            pendingTokens.length > 0 && (
              <section className="panel mb-md flex flex-wrap items-center justify-between gap-md px-md py-md">
                <div className="min-w-0">
                  <p className="label-mono">No one being seen</p>
                  <p className="mt-2xs font-display text-lg font-semibold">
                    Next up — <span className="token-id">#{pendingTokens[0].token}</span> {pendingTokens[0].name}
                  </p>
                </div>
                <NextPatientButton
                  onClick={handleNext}
                  disabled={busy}
                  label={busy ? 'Updating…' : 'Call next patient'}
                />
              </section>
            )
          )}

          {showNotes && (
            <ConsultNotes
              token={showNotes}
              doctorId={doctorId}
              onClose={() => setShowNotes(null)}
            />
          )}

          <div className="grid gap-md">
            <Panel
              title="Waiting"
              meta={`${pendingTokens.length} ${pendingTokens.length === 1 ? 'patient' : 'patients'} in line`}
              flush
            >
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Patient</th>
                      <th>Condition</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTokens.map(t => (
                      <tr key={t.id || t.token}>
                        <td className="token-id">#{t.token}</td>
                        <td className="cell-strong">
                          {t.name}
                          {t.age != null && <span className="ml-2xs font-normal text-ink-3">({t.age})</span>}
                        </td>
                        <td>{t.condition || '—'}</td>
                        <td><PaymentChip status={t.paymentStatus || t.payment_status} /></td>
                      </tr>
                    ))}
                    {pendingTokens.length === 0 && (
                      <tr>
                        <td colSpan={4}>
                          <EmptyState
                            title="No one waiting"
                            hint="New bookings for you will appear here automatically."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>

            {finishedTokens.length > 0 && (
              <Panel title="Closed today" meta={`${finishedTokens.length} ${finishedTokens.length === 1 ? 'token' : 'tokens'}`} flush>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Patient</th>
                        <th>Condition</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finishedTokens.map(t => (
                        <tr key={t.id || t.token}>
                          <td className="token-id">#{t.token}</td>
                          <td>{t.name}</td>
                          <td>{t.condition || '—'}</td>
                          <td><StatusChip tone="muted">{t.status.replace(/_/g, ' ')}</StatusChip></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}
          </div>
        </>
      )}
    </div>
  )
}