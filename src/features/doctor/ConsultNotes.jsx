import { useState } from 'react'
import { consultNotesService } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'

export function ConsultNotes({ token, doctorId, onClose }) {
  const [notes, setNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [followUp, setFollowUp] = useState(false)
  const [status, setStatus] = useState('completed')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    if (!isSupabaseActive) {
      setSaved(true)
      setTimeout(onClose, 1200)
      return
    }
    setSaving(true)
    try {
      await consultNotesService.create({
        doctor_id: doctorId,
        token: token.token,
        notes,
        diagnosis,
        follow_up: followUp,
        consult_status: status,
        completed_at: new Date().toISOString(),
      })
      setSaved(true)
      setTimeout(onClose, 1200)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Consult — Token #{token.token} ({token.name})
        </h2>

        {saved ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-green-700 font-semibold">Consult saved</p>
          </div>
        ) : (
          <>
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

            {error && (
              <div className="bg-red-50 text-red-700 p-2 rounded my-3 text-sm">{error}</div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving…' : 'Save Consult'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
