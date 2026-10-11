import { useState } from 'react'

export function ConsultNotes({ token, onClose }) {
  const [notes, setNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [followUp, setFollowUp] = useState(false)
  const [status, setStatus] = useState('completed')

  const handleSubmit = () => {
    const result = {
      token,
      notes,
      diagnosis,
      followUp,
      consultStatus: status,
      completedAt: new Date().toISOString()
    }
    onClose()
    console.log('Consult saved:', result)
    alert(`Consult saved!\nStatus: ${status}\nNotes: ${notes}\nDiagnosis: ${diagnosis}`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Consult — Token #{token.token} ({token.name})
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Consult Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="completed">Completed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="referral">Referred</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded h-24"
              placeholder="Add clinical notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter diagnosis..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={followUp}
                onChange={(e) => setFollowUp(e.target.checked)}
              />
              Follow-up required
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
            Save Consult
          </button>
        </div>
      </div>
    </div>
  )
}
