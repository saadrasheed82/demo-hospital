import { useState, useEffect } from 'react'
import { useDoctor } from './DoctorLayout'
import { ArrivalToggle } from './ArrivalToggle'
import { NextPatientButton } from './NextPatientButton'
import { ConsultNotes } from './ConsultNotes'
import { tokensService } from '../../services/supabase'

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
      {isDemo && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-700">
          🎭 Demo mode — database not connected. Showing sample queue.
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{doctor?.name || 'Doctor'} — Today's Queue</h1>
        <ArrivalToggle status={arrivalStatus} onStatusChange={setArrivalStatus} />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading queue…</p>
      ) : (
        <>
          {currentToken ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
              <p className="text-sm text-gray-600">Currently Seeing</p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-yellow-700">Token #{currentToken.token}</span>
                  <span className="ml-4 text-xl">{currentToken.name}</span>
                  {(currentToken.condition || currentToken.age != null) && (
                    <p className="text-gray-600">
                      {[currentToken.condition, currentToken.age != null ? `${currentToken.age} yrs` : null]
                        .filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNotes(currentToken)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Notes
                  </button>
                  <NextPatientButton
                    onClick={handleNext}
                    disabled={busy}
                    label={busy ? 'Updating…' : 'Next Patient →'}
                  />
                </div>
              </div>
            </div>
          ) : (
            pendingTokens.length > 0 && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded">
                <p className="text-sm text-gray-600">No patient being seen — next in queue</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">
                    #{pendingTokens[0].token} — {pendingTokens[0].name}
                  </span>
                  <NextPatientButton
                    onClick={handleNext}
                    disabled={busy}
                    label={busy ? 'Updating…' : 'Call Next Patient →'}
                  />
                </div>
              </div>
            )
          )}

          {showNotes && (
            <ConsultNotes
              token={showNotes}
              doctorId={doctorId}
              onClose={() => setShowNotes(null)}
            />
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Waiting ({pendingTokens.length})</h2>
            <table className="w-full border-collapse bg-white shadow rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Token</th>
                  <th className="p-3 text-left">Patient</th>
                  <th className="p-3 text-left">Condition</th>
                  <th className="p-3 text-left">Payment</th>
                </tr>
              </thead>
              <tbody>
                {pendingTokens.map(t => (
                  <tr key={t.id || t.token} className="border-t">
                    <td className="p-3 font-bold">{t.token}</td>
                    <td className="p-3">{t.name}{t.age != null ? ` (${t.age})` : ''}</td>
                    <td className="p-3">{t.condition || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        (t.paymentStatus || t.payment_status) === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {t.paymentStatus || t.payment_status || 'unpaid'}
                      </span>
                    </td>
                  </tr>
                ))}
                {pendingTokens.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">No one waiting.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {finishedTokens.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Completed ({finishedTokens.length})</h2>
              <div className="space-y-2">
                {finishedTokens.map(t => (
                  <div key={t.id || t.token} className="p-3 bg-gray-50 rounded flex justify-between">
                    <span>#{t.token} — {t.name} {t.condition ? `(${t.condition})` : ''}</span>
                    <span className="text-green-600 text-sm">
                      {t.status === 'completed' ? '✓ Completed' : t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
