import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { patientsService, tokensService, doctorsService } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'
import { Button, EmptyState, Notice, PageHeader, Panel, QueueChip, SkeletonRows, StatusChip } from '../../components/ui'

export default function TrackQueue() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [myToken, setMyToken] = useState(null)
  const [queue, setQueue] = useState([])
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseActive) {
      setLoading(false)
      return
    }

    const email = user?.email
    if (!email) {
      setLoading(false)
      return
    }

    let active = true
    const load = async () => {
      const patient = await patientsService.getByEmail(email)
      if (!patient) {
        if (active) { setMyToken(null); setLoading(false) }
        return
      }

      // The active token is the most recent non-completed one.
      const mine = await tokensService.getByPatient(patient.id)
      const myTok = mine.find(t => t.status === 'current' || t.status === 'pending') || mine[0] || null
      if (active) setMyToken(myTok)

      if (myTok) {
        const [all, doc] = await Promise.all([
          tokensService.getByDoctor(myTok.doctor_id),
          doctorsService.get(myTok.doctor_id),
        ])
        if (active) {
          setQueue(all)
          setDoctor(doc)
        }
      }
      if (active) setLoading(false)
    }

    load()
    const unsub = tokensService.subscribe(() => load())
    return () => {
      active = false
      unsub()
    }
  }, [user?.email])

  const header = (
    <PageHeader
      eyebrow="Patient portal"
      title="My queue"
      meta="This page updates the moment the counter calls a token."
    />
  )

  if (!isSupabaseActive) {
    return (
      <div>
        {header}
        <Notice tone="warn" title="Demo mode">
          Live queue tracking needs a database connection. Book against a connected hospital to see your position.
        </Notice>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        {header}
        <Panel title="Your token">
          <SkeletonRows rows={3} />
        </Panel>
      </div>
    )
  }

  if (!myToken) {
    return (
      <div>
        {header}
        <div className="panel">
          <EmptyState
            title="No active appointment"
            hint="Book a doctor and your token, position and live queue will appear here."
            action={<Button onClick={() => navigate('/patient')}>Find a doctor</Button>}
          />
        </div>
      </div>
    )
  }

  // Position = count of tokens ahead of me that are still active.
  const ahead = queue.filter(t =>
    t.id !== myToken.id &&
    (t.status === 'pending' || t.status === 'current') &&
    parseInt(t.token, 10) < parseInt(myToken.token, 10)
  ).length
  const myPosition = ahead + 1
  const total = queue.filter(t => t.status !== 'completed' && t.status !== 'no_show').length
  const isMyTurn = myToken.status === 'current'
  const activeQueue = queue.filter(t => t.status !== 'completed')

  return (
    <div>
      {header}

      {/* ── the one dark beat: your token ────────────────────────────── */}
      <section className="graphite mb-md p-md lg:p-lg">
        <div className="flex flex-wrap items-start justify-between gap-md">
          <div>
            <p className="label-mono">Your token</p>
            <p className="mt-2xs font-mono text-4xl font-semibold leading-none tracking-tight lg:text-5xl">
              #{myToken.token}
            </p>
            <p className="mt-sm text-sm text-graphite-dim">
              {doctor?.name || '—'}
              {doctor?.specialty ? ` · ${doctor.specialty}` : ''}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-lg gap-y-sm sm:grid-cols-3">
            <div>
              <dt className="label-mono">Position</dt>
              <dd className="mt-3xs font-display text-lg font-semibold tnum">
                {myPosition} <span className="text-sm font-normal text-graphite-dim">of {total}</span>
              </dd>
            </div>
            <div>
              <dt className="label-mono">Payment</dt>
              <dd className="mt-3xs font-display text-lg font-semibold">
                {myToken.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
              </dd>
            </div>
            <div>
              <dt className="label-mono">Room</dt>
              <dd className="mt-3xs font-display text-lg font-semibold">{doctor?.room || '—'}</dd>
            </div>
          </dl>
        </div>

        {isMyTurn && (
          <p className="mt-md border-t border-graphite-2 pt-sm text-sm font-medium">
            It&apos;s your turn — please head to {doctor?.room ? `Room ${doctor.room}` : 'the doctor\'s room'}.
          </p>
        )}
      </section>

      {myToken.payment_status !== 'paid' && (
        <div className="mb-md">
          <Notice tone="warn" title="Payment outstanding">
            Your token is in the queue, but the fee is unpaid. Settle it before your turn to keep your place.{' '}
            <Link className="link" to={`/patient/pay/${myToken.doctor_id}`}>
              Pay now
            </Link>
          </Notice>
        </div>
      )}

      <Panel title="Live queue" meta={`${activeQueue.length} active ${activeQueue.length === 1 ? 'token' : 'tokens'}`} flush>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeQueue.map(t => {
                const mine = t.id === myToken.id
                return (
                  <tr key={t.id} className={mine ? 'row-mine' : t.status === 'current' ? 'row-focus' : ''}>
                    <td className="token-id">#{t.token}</td>
                    <td className={mine ? 'cell-strong' : ''}>
                      {mine ? 'You' : t.patient_name}
                    </td>
                    <td>{mine && t.status !== 'current' ? <StatusChip tone="warn">Your token</StatusChip> : <QueueChip status={t.status} />}</td>
                  </tr>
                )
              })}
              {activeQueue.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <EmptyState title="The queue is clear" hint="No active tokens for this doctor right now." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}