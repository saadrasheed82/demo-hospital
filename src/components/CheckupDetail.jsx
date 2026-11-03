import { StatusChip } from './ui'
import { formatDuration, formatDateTime, formatTime } from '../shared/utils/checkup'

const CONSULT_LABEL = {
  completed: 'Completed',
  rescheduled: 'Rescheduled',
  referral: 'Referred',
}
const CONSULT_TONE = {
  completed: 'ok',
  rescheduled: 'warn',
  referral: 'active',
}

/* One checkup, rendered the same way wherever it is shown: the doctor, the
 * patient, when the visit ran, and — only for the people allowed to read them —
 * the clinical notes. `showNotes={false}` is the staff/admin variant.
 */
export function CheckupDetail({ checkup, showNotes = true }) {
  const { doctor, patient, tokenNumber, startedAt, endedAt, durationMs, note } = checkup

  const duration = formatDuration(durationMs)
  const timing =
    startedAt && endedAt
      ? `${formatTime(startedAt)} – ${formatTime(endedAt)}${duration ? ` · ${duration}` : ''}`
      : startedAt
        ? `Started ${formatTime(startedAt)} · still in progress`
        : endedAt
          ? `Closed ${formatTime(endedAt)}`
          : 'Timing not recorded'

  return (
    <div className="grid gap-sm sm:grid-cols-2">
      <div>
        <p className="label-mono">Doctor</p>
        <p className="mt-3xs text-sm font-medium text-ink">{doctor?.name || '—'}</p>
        <p className="text-xs text-ink-3">
          {[doctor?.specialty, doctor?.room ? `Room ${doctor.room}` : null].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>

      <div>
        <p className="label-mono">Patient</p>
        <p className="mt-3xs text-sm font-medium text-ink">
          {patient?.name || '—'}
          {patient?.age != null && <span className="ml-2xs font-normal text-ink-3">({patient.age})</span>}
        </p>
        <p className="text-xs text-ink-3">{patient?.phone || '—'}</p>
      </div>

      <div>
        <p className="label-mono">Token</p>
        <p className="mt-3xs token-id">{tokenNumber ? `#${tokenNumber}` : '—'}</p>
      </div>

      <div>
        <p className="label-mono">Checkup timing</p>
        <p className="mt-3xs text-sm text-ink">{timing}</p>
        {note?.completed_at && (
          <p className="text-xs text-ink-3">Notes filed {formatDateTime(note.completed_at)}</p>
        )}
      </div>

      {showNotes && (
        <div className="border-t border-rule pt-sm sm:col-span-2">
          {note ? (
            <>
              <div className="flex flex-wrap items-center gap-2xs">
                <StatusChip tone={CONSULT_TONE[note.consult_status] || 'neutral'}>
                  {CONSULT_LABEL[note.consult_status] || note.consult_status || 'Recorded'}
                </StatusChip>
                {note.follow_up && <StatusChip tone="warn">Follow-up required</StatusChip>}
              </div>

              {note.diagnosis && (
                <p className="mt-2xs text-sm">
                  <span className="label-mono mr-2xs">Diagnosis</span>
                  <span className="font-medium text-ink">{note.diagnosis}</span>
                </p>
              )}
              {note.notes && <p className="mt-2xs whitespace-pre-wrap text-sm text-ink-2">{note.notes}</p>}
            </>
          ) : (
            <p className="text-sm text-ink-3">No notes were filed for this visit.</p>
          )}
        </div>
      )}
    </div>
  )
}
