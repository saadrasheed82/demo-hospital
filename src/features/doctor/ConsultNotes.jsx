import { useState } from 'react'
import { consultNotesService } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'
import { Button, Field, Modal, Notice } from '../../components/ui'

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
    <Modal
      title={`Consult notes — token #${token.token}`}
      meta={token.name}
      onClose={onClose}
      width="max-w-lg"
    >
      {saved ? (
        <Notice tone="ok" title="Consult saved">
          The notes were filed against token #{token.token}.
        </Notice>
      ) : (
        <div className="space-y-sm">
          <Field label="Outcome" htmlFor="consult-status">
            <select
              id="consult-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input"
            >
              <option value="completed">Completed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="referral">Referred</option>
            </select>
          </Field>

          <Field label="Diagnosis" htmlFor="consult-diagnosis">
            <input
              id="consult-diagnosis"
              type="text"
              className="input"
              placeholder="Enter diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </Field>

          <Field label="Clinical notes" htmlFor="consult-notes">
            <textarea
              id="consult-notes"
              className="input"
              placeholder="Observations, medication, instructions for the patient…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-2xs text-sm text-ink-2">
            <input
              type="checkbox"
              checked={followUp}
              onChange={(e) => setFollowUp(e.target.checked)}
              className="size-4 accent-[oklch(58%_0.20_256)]"
            />
            Follow-up required
          </label>

          {error && <Notice tone="danger">{error}</Notice>}

          <div className="flex flex-wrap justify-end gap-2xs border-t border-rule pt-sm">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving} loadingLabel="Saving…">
              Save consult
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}