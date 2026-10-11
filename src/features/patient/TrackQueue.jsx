import { useState } from 'react'

const MOCK_TOKEN = { token: '104', doctor: 'Dr. Ahmed', specialty: 'Cardiology', position: 3, eta: '~15 min', status: 'waiting' }
const MOCK_QUEUE = [
  { token: '101', name: 'Sarah Johnson', status: 'current' },
  { token: '102', name: 'Ali Hassan', status: 'pending' },
  { token: '103', name: 'Maria Garcia', status: 'pending' },
]

export default function TrackQueue() {
  const [tokens] = useState([
    { token: '101', name: 'Sarah Johnson', status: 'current', condition: 'Chest pain' },
    { token: '102', name: 'Ali Hassan', status: 'pending', condition: 'Routine checkup' },
    { token: '103', name: 'Maria Garcia', status: 'pending', condition: 'Skin rash' },
  ])

  const myPosition = tokens.findIndex(t => t.token === MOCK_TOKEN.token) + 1

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Appointment</h1>

      <div className="bg-blue-50 border border-blue-200 rounded p-6 mb-6 text-center">
        <p className="text-gray-600 mb-1">Your Token</p>
        <p className="text-5xl font-bold text-blue-600 mb-4">#{MOCK_TOKEN.token}</p>
        <div className="flex justify-center gap-6 text-sm">
          <div>
            <p className="text-gray-500">Doctor</p>
            <p className="font-semibold">{MOCK_TOKEN.doctor}</p>
          </div>
          <div>
            <p className="text-gray-500">Position</p>
            <p className="font-semibold">{MOCK_TOKEN.position} of {tokens.length}</p>
          </div>
          <div>
            <p className="text-gray-500">ETA</p>
            <p className="font-semibold">{MOCK_TOKEN.eta}</p>
          </div>
        </div>
      </div>

      <h2 className="font-semibold mb-3">Live Queue</h2>
      <div className="space-y-2">
        {tokens.map(t => (
          <div
            key={t.token}
            className={`flex justify-between items-center p-3 rounded ${
              t.token === MOCK_TOKEN.token
                ? 'bg-yellow-100 border-2 border-yellow-400'
                : t.status === 'current'
                ? 'bg-green-50 border border-green-200'
                : 'bg-white border'
            }`}
          >
            <div>
              <span className="font-bold">#{t.token}</span>
              <span className="ml-3">{t.name}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              t.status === 'current' ? 'bg-green-100 text-green-800' :
              t.token === MOCK_TOKEN.token ? 'bg-yellow-200 text-yellow-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {t.status === 'current' ? 'Being seen' :
               t.token === MOCK_TOKEN.token ? 'Your turn' : 'Waiting'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
