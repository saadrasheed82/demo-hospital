// Checkup = one token visit plus the consult note filed against it.
// Timing runs from the moment a token is called (started_at) to the moment it
// closes (ended_at). Both stamps live on the tokens row.

export const checkupDurationMs = (token) => {
  const start = token?.started_at ? Date.parse(token.started_at) : NaN
  const end = token?.ended_at ? Date.parse(token.ended_at) : NaN
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  const delta = end - start
  return delta >= 0 ? delta : null
}

export const formatDuration = (ms) => {
  if (ms == null) return null
  const minutes = Math.floor(ms / 60000)
  if (minutes < 1) return 'under a minute'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 1) return `${minutes} min`
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`
}

export const formatTime = (ts) => (ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null)

export const formatDateTime = (ts) => (ts ? new Date(ts).toLocaleString() : null)

const noteKey = (doctorId, token) => `${doctorId}::${token}`

// Notes are filed against a token number within a doctor's own queue, so
// (doctor_id, token) is the natural key. A token number can be reused across
// days, so the latest note wins.
export const indexNotesByDoctorToken = (notes = []) => {
  const index = new Map()
  for (const note of notes) {
    if (!note?.token || !note?.doctor_id) continue
    const key = noteKey(note.doctor_id, note.token)
    const existing = index.get(key)
    if (!existing) {
      index.set(key, note)
      continue
    }
    const incoming = Date.parse(note.completed_at || note.created_at || 0) || 0
    const held = Date.parse(existing.completed_at || existing.created_at || 0) || 0
    if (incoming >= held) index.set(key, note)
  }
  return index
}

// An appointment reaches its checkup through appointments.token_id. Rows booked
// before that column existed have no link, so fall back to the patient's token
// for the same doctor created closest in time.
const nearestToken = (appointment, tokens) => {
  const candidates = tokens.filter(
    (t) => t.doctor_id === appointment.doctor_id
      && (!appointment.patient_id || !t.patient_id || t.patient_id === appointment.patient_id),
  )
  if (candidates.length === 0) return null
  const anchor = Date.parse(appointment.created_at || 0) || 0
  return candidates.reduce((best, candidate) => {
    const bestGap = Math.abs((Date.parse(best.created_at || 0) || 0) - anchor)
    const gap = Math.abs((Date.parse(candidate.created_at || 0) || 0) - anchor)
    return gap < bestGap ? candidate : best
  })
}

export const resolveAppointmentCheckup = (appointment, { tokens = [], notes = [], doctors = [], patients = [] } = {}) => {
  const doctor = doctors.find((d) => d.id === appointment?.doctor_id) || null
  const patient = patients.find((p) => p.id === appointment?.patient_id) || null

  const linked = appointment?.token_id ? tokens.find((t) => t.id === appointment.token_id) : null
  const token = linked || nearestToken(appointment || {}, tokens)

  // Never attach a note that belongs to a different patient's visit.
  const sameVisit = token
    && (!appointment?.patient_id || !token.patient_id || token.patient_id === appointment.patient_id)
  const note = sameVisit ? indexNotesByDoctorToken(notes).get(noteKey(token.doctor_id, token.token)) || null : null

  return {
    appointment,
    doctor,
    patient,
    token: token || null,
    tokenNumber: token?.token || null,
    startedAt: token?.started_at || null,
    endedAt: token?.ended_at || null,
    durationMs: token ? checkupDurationMs(token) : null,
    note,
  }
}
