import { useState, useEffect } from 'react'
import { doctorsService, tokensService } from '../../services/supabase'
import { Button, EmptyState, Field, Notice, PageHeader, Panel, QueueChip, SkeletonRows } from '../../components/ui'

export default function LiveQueue() {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!selectedDoctor) return
    setLoading(true)
    const unsubscribe = tokensService.subscribe(selectedDoctor, (tokens) => {
      const sorted = [...tokens].sort((a, b) => parseInt(a.token, 10) - parseInt(b.token, 10))
      setQueue(sorted)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [selectedDoctor])

  // Loads the doctor list once; drives the selector and defaults to the first doctor.
  useEffect(() => {
    const unsubscribe = doctorsService.subscribe((docs) => {
      setDoctors(docs)
      if (docs.length) setSelectedDoctor(prev => prev || docs[0].id)
    })
    return unsubscribe
  }, [])

  const handleCall = async (tokenRow) => {
    setActionLoadingId(tokenRow.id)
    setError(null)
    try {
      const current = queue.find(t => t.status === 'current')
      if (current && current.id !== tokenRow.id) {
        await tokensService.update(current.id, { status: 'completed' })
      }
      await tokensService.update(tokenRow.id, { status: 'current' })
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleMoveToEnd = async (tokenRow) => {
    setActionLoadingId(tokenRow.id)
    setError(null)
    try {
      const maxToken = queue.reduce((max, t) => Math.max(max, parseInt(t.token, 10) || 0), 100)
      await tokensService.update(tokenRow.id, { token: String(maxToken + 1), status: 'end_of_queue' })
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const doctor = doctors.find(d => d.id === selectedDoctor)
  const waiting = queue.filter(t => t.status === 'pending')
  const current = queue.find(t => t.status === 'current')
  const finished = queue.filter(t => !['pending', 'current'].includes(t.status))

  return (
    <div>
      <PageHeader
        eyebrow="Counter desk"
        title="Live queue"
        meta={
          doctor
            ? `${doctor.name} · ${doctor.specialty}${doctor.room ? ` · Room ${doctor.room}` : ''}`
            : 'Select a doctor to open their queue.'
        }
        actions={
          <div className="w-full max-w-xs">
            <Field label="Doctor" htmlFor="queue-doctor">
              <select
                id="queue-doctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="input"
              >
                {doctors.length === 0 && <option value="">No doctors available</option>}
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                ))}
              </select>
            </Field>
          </div>
        }
      />

      <div className="mb-md grid grid-cols-3 gap-xs">
        <div className="panel px-md py-sm">
          <p className="label-mono">Waiting</p>
          <p className="mt-2xs font-display text-xl font-semibold tnum">{waiting.length}</p>
        </div>
        <div className="panel px-md py-sm">
          <p className="label-mono">Seeing now</p>
          <p className="mt-2xs font-display text-xl font-semibold tnum text-accent">
            {current ? `#${current.token}` : '—'}
          </p>
        </div>
        <div className="panel px-md py-sm">
          <p className="label-mono">Closed</p>
          <p className="mt-2xs font-display text-xl font-semibold tnum text-ink-3">{finished.length}</p>
        </div>
      </div>

      {error && (
        <div className="mb-md">
          <Notice tone="danger" title="Queue action failed">{error}</Notice>
        </div>
      )}

      <Panel
        title="Waiting"
        meta={`${waiting.length} ${waiting.length === 1 ? 'patient' : 'patients'} in line`}
        flush
      >
        {loading ? (
          <div className="panel-body">
            <SkeletonRows rows={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {queue.map(token => (
                  <tr key={token.id} className={token.status === 'current' ? 'row-focus' : ''}>
                    <td className="token-id">#{token.token}</td>
                    <td className="cell-strong">{token.patient_name}</td>
                    <td className="tnum">{token.age ?? '—'}</td>
                    <td>{token.condition || '—'}</td>
                    <td><QueueChip status={token.status} /></td>
                    <td className="text-right">
                      {token.status === 'no-show' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMoveToEnd(token)}
                          loading={actionLoadingId === token.id}
                          loadingLabel="Moving…"
                        >
                          Move to end
                        </Button>
                      ) : token.status === 'pending' ? (
                        <Button
                          size="sm"
                          onClick={() => handleCall(token)}
                          loading={actionLoadingId === token.id}
                          loadingLabel="Calling…"
                        >
                          Call
                        </Button>
                      ) : (
                        <span className="text-xs text-ink-3">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="No patients in this queue"
                        hint="Bookings for this doctor will appear here the moment they are created."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}