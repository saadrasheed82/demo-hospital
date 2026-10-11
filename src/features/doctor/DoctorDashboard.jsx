import { useState } from 'react'
import { ArrivalToggle } from './ArrivalToggle'
import { NextPatientButton } from './NextPatientButton'
import { ConsultNotes } from './ConsultNotes'

const INITIAL_TOKENS = [
  { token: '101', name: 'Sarah Johnson', age: 34, condition: 'Chest pain', paymentStatus: 'paid', status: 'current' },
  { token: '102', name: 'Ali Hassan', age: 45, condition: 'Routine checkup', paymentStatus: 'paid', status: 'pending' },
  { token: '103', name: 'Maria Garcia', age: 28, condition: 'Skin rash', paymentStatus: 'paid', status: 'pending' },
  { token: '104', name: 'Omar Faruk', age: 67, condition: 'Joint pain', paymentStatus: 'paid', status: 'pending' },
  { token: '105', name: 'Layla Ameen', age: 12, condition: 'Fever', paymentStatus: 'unpaid', status: 'pending' },
]

export default function DoctorDashboard() {
  const [tokens, setTokens] = useState(INITIAL_TOKENS)
  const [arrivalStatus, setArrivalStatus] = useState('arrived')
  const [showNotes, setShowNotes] = useState(null)

  const handleNextPatient = () => {
    const currentIdx = tokens.findIndex(t => t.status === 'current')
    if (currentIdx === -1) return

    const completed = {
      ...tokens[currentIdx],
      status: 'completed',
      completedAt: new Date().toISOString()
    }
    const updated = tokens.map((t, i) =>
      i === currentIdx ? completed : t
    )
    setTokens(updated)

    // Mark next pending as current
    const nextIdx = updated.findIndex(t => t.status === 'pending')
    if (nextIdx !== -1) {
      updated[nextIdx] = { ...updated[nextIdx], status: 'current' }
      setTokens([...updated])
    }
  }

  const currentToken = tokens.find(t => t.status === 'current')
  const pendingTokens = tokens.filter(t => t.status === 'pending')
  const completedTokens = tokens.filter(t => t.status === 'completed')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dr. Ahmed — Today's Queue</h1>
        <ArrivalToggle
          status={arrivalStatus}
          onStatusChange={setArrivalStatus}
        />
      </div>

      {currentToken && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <p className="text-sm text-gray-600">Currently Seeing</p>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold text-yellow-700">Token #{currentToken.token}</span>
              <span className="ml-4 text-xl">{currentToken.name}</span>
              <p className="text-gray-600">{currentToken.condition} · {currentToken.age} yrs</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNotes(currentToken)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Notes
              </button>
              <NextPatientButton onClick={handleNextPatient} />
            </div>
          </div>
        </div>
      )}

      {showNotes && (
        <ConsultNotes
          token={showNotes}
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
              <tr key={t.token} className="border-t">
                <td className="p-3 font-bold">{t.token}</td>
                <td className="p-3">{t.name} ({t.age})</td>
                <td className="p-3">{t.condition}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    t.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {t.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {completedTokens.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Completed ({completedTokens.length})</h2>
          <div className="space-y-2">
            {completedTokens.map(t => (
              <div key={t.token} className="p-3 bg-gray-50 rounded flex justify-between">
                <span>#{t.token} — {t.name} ({t.condition})</span>
                <span className="text-green-600 text-sm">✓ Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
