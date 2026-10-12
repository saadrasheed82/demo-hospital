import { useState, useEffect } from 'react'
import { doctorsService, tokensService } from '../../services/supabase'

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
    return () => unsubscribe()
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Live Queue</h1>
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="p-2 border rounded bg-white"
        >
          {doctors.map(d => (
            <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
          ))}
        </select>
      </div>

      <p className="text-gray-600 mb-4">
        Current doctor: <strong>{doctor?.name || '—'}</strong> — Room: {doctor?.room || '—'}
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <div className="p-4 text-center">
          <p className="text-gray-500">Loading queue...</p>
        </div>
      ) : (
        <table className="w-full border-collapse bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Token</th>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Age</th>
              <th className="p-3 text-left">Condition</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map(token => (
              <tr key={token.id} className="border-t">
                <td className="p-3 font-bold text-lg">{token.token}</td>
                <td className="p-3">{token.patient_name}</td>
                <td className="p-3">{token.age}</td>
                <td className="p-3">{token.condition}</td>
                <td className="p-3"><StatusBadge status={token.status} /></td>
                <td className="p-3">
                  {token.status === 'no-show' ? (
                    <button
                      onClick={() => handleMoveToEnd(token)}
                      disabled={actionLoadingId === token.id}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {actionLoadingId === token.id ? 'Moving...' : 'Move to End'}
                    </button>
                  ) : token.status === 'pending' ? (
                    <button
                      onClick={() => handleCall(token)}
                      disabled={actionLoadingId === token.id}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {actionLoadingId === token.id ? 'Calling...' : 'Call'}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No patients in queue for this doctor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const styles = {
    current: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-green-100 text-green-800',
    'no-show': 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
    end_of_queue: 'bg-blue-100 text-blue-800',
  }
  const labels = {
    current: 'Seeing Now',
    pending: 'Waiting',
    'no-show': 'No-Show',
    completed: 'Completed',
    end_of_queue: 'Re-queued',
  }
  return (
    <span className={`px-2 py-1 rounded text-xs ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  )
}
