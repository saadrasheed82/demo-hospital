import { useState } from 'react'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { reorderNoShow } from '../../shared/utils/tokenGenerator'

// Mock queue data for Dr. Ahmed
const MOCK_QUEUE = [
  { id: 't1', token: '101', patientName: 'Sarah Johnson', status: 'current', condition: 'Chest pain', age: 34 },
  { id: 't2', token: '102', patientName: 'Ali Hassan', status: 'pending', condition: 'Routine checkup', age: 45 },
  { id: 't3', token: '103', patientName: 'Maria Garcia', status: 'pending', condition: 'Skin rash', age: 28 },
  { id: 't4', token: '104', patientName: 'Omar Faruk', status: 'no-show', condition: 'Joint pain', age: 67 },
  { id: 't5', token: '105', patientName: 'Layla Ameen', status: 'pending', condition: 'Fever', age: 12 },
]

export default function LiveQueue() {
  const [selectedDoctor, setSelectedDoctor] = useState('doc1')
  const [queue, setQueue] = useState(MOCK_QUEUE)

  const handleMoveToEnd = (tokenId) => {
    const updated = reorderNoShow(queue, tokenId)
    setQueue(updated)
  }

  const doctor = TEST_DOCTORS.find(d => d.id === selectedDoctor) || TEST_DOCTORS[0]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Live Queue</h1>
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="p-2 border rounded bg-white"
        >
          {TEST_DOCTORS.map(d => (
            <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
          ))}
        </select>
      </div>

      <p className="text-gray-600 mb-4">
        Current doctor: <strong>{doctor.name}</strong> — Room: {doctor.room}
      </p>

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
              <td className="p-3">{token.patientName}</td>
              <td className="p-3">{token.age}</td>
              <td className="p-3">{token.condition}</td>
              <td className="p-3">
                <StatusBadge status={token.status} />
              </td>
              <td className="p-3">
                {token.status === 'no-show' && (
                  <button
                    onClick={() => handleMoveToEnd(token.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Move to End
                  </button>
                )}
                {token.status === 'pending' && (
                  <button className="text-gray-600 text-sm hover:text-gray-800">
                    Call
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
