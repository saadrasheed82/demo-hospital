// Shared vocabulary for doctor availability, so patient, admin and staff
// screens all read the same statuses with the same labels and tones.

export const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'on_break', label: 'On break' },
  { value: 'off_duty', label: 'Off duty' },
]

const AVAILABILITY_META = {
  available: { tone: 'ok', label: 'Available' },
  on_break: { tone: 'warn', label: 'On break' },
  off_duty: { tone: 'muted', label: 'Off duty' },
}

export function availabilityMeta(status) {
  return AVAILABILITY_META[status] || { tone: 'neutral', label: status || '—' }
}

// openTokens: rows shaped { doctor_id, token, status } with status in
// ['pending', 'current']. Returns { [doctorId]: { waiting, currentToken } }
// where currentToken is the token number string being seen, or null.
export function openTokensByDoctor(openTokens) {
  const map = {}
  for (const t of openTokens || []) {
    if (t.status !== 'pending' && t.status !== 'current') continue
    const entry = map[t.doctor_id] || (map[t.doctor_id] = { waiting: 0, currentToken: null })
    if (t.status === 'pending') entry.waiting += 1
    else entry.currentToken = t.token
  }
  return map
}

// One-line live status for a single doctor: "Now seeing #104 · 3 waiting",
// "Next up #102 · 3 waiting", or null when the queue is empty.
export function liveQueueLine(counts, doctorId) {
  const c = counts?.[doctorId]
  if (!c) return null
  const parts = []
  if (c.currentToken) parts.push(`Now seeing #${c.currentToken}`)
  if (c.waiting > 0) parts.push(`${c.waiting} waiting`)
  return parts.length ? parts.join(' · ') : null
}
