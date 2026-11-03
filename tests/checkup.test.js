import { test, expect, describe } from 'vitest'
import {
  checkupDurationMs,
  formatDuration,
  indexNotesByDoctorToken,
  resolveAppointmentCheckup,
} from '../src/shared/utils/checkup'

describe('checkupDurationMs', () => {
  test('measures the gap between start and end', () => {
    expect(checkupDurationMs({
      started_at: '2026-11-03T12:00:00.000Z',
      ended_at: '2026-11-03T12:17:00.000Z',
    })).toBe(17 * 60 * 1000)
  })

  test('returns null when either stamp is missing', () => {
    expect(checkupDurationMs({ started_at: '2026-11-03T12:00:00.000Z', ended_at: null })).toBeNull()
    expect(checkupDurationMs({ started_at: null, ended_at: '2026-11-03T12:00:00.000Z' })).toBeNull()
  })

  test('returns null for an end before the start', () => {
    expect(checkupDurationMs({
      started_at: '2026-11-03T12:17:00.000Z',
      ended_at: '2026-11-03T12:00:00.000Z',
    })).toBeNull()
  })
})

describe('formatDuration', () => {
  test('formats minutes, hours and the sub-minute case', () => {
    expect(formatDuration(17 * 60 * 1000)).toBe('17 min')
    expect(formatDuration(60 * 60 * 1000)).toBe('1 hr')
    expect(formatDuration(90 * 60 * 1000)).toBe('1 hr 30 min')
    expect(formatDuration(20 * 1000)).toBe('under a minute')
  })

  test('passes null through', () => {
    expect(formatDuration(null)).toBeNull()
  })
})

describe('indexNotesByDoctorToken', () => {
  test('keys notes by doctor and token number', () => {
    const index = indexNotesByDoctorToken([
      { doctor_id: 'doc1', token: '105', notes: 'first' },
      { doctor_id: 'doc2', token: '105', notes: 'second' },
    ])
    expect(index.get('doc1::105').notes).toBe('first')
    expect(index.get('doc2::105').notes).toBe('second')
  })

  test('keeps the most recently filed note for a repeated pair', () => {
    const index = indexNotesByDoctorToken([
      { doctor_id: 'doc1', token: '101', notes: 'older', completed_at: '2026-01-01T00:00:00Z' },
      { doctor_id: 'doc1', token: '101', notes: 'newer', completed_at: '2026-02-01T00:00:00Z' },
    ])
    expect(index.get('doc1::101').notes).toBe('newer')
  })

  test('ignores notes with no token', () => {
    const index = indexNotesByDoctorToken([{ doctor_id: 'doc1', token: null }])
    expect(index.size).toBe(0)
  })
})

describe('resolveAppointmentCheckup', () => {
  const doctor = { id: 'doc1', name: 'Dr. Ahmed', specialty: 'Cardiology', room: 'Cardio-1' }
  const patient = { id: 'p1', name: 'Sarah Johnson', age: 34 }

  test('joins an appointment to its checkup through token_id', () => {
    const result = resolveAppointmentCheckup(
      { id: 'apt1', doctor_id: 'doc1', patient_id: 'p1', token_id: 'tok1' },
      {
        tokens: [{ id: 'tok1', doctor_id: 'doc1', token: '105', started_at: '2026-11-03T12:00:00Z', ended_at: '2026-11-03T12:10:00Z' }],
        notes: [{ doctor_id: 'doc1', token: '105', notes: 'rest well', diagnosis: 'flu' }],
        doctors: [doctor],
        patients: [patient],
      },
    )
    expect(result.tokenNumber).toBe('105')
    expect(result.doctor).toMatchObject({ name: 'Dr. Ahmed' })
    expect(result.patient).toMatchObject({ name: 'Sarah Johnson' })
    expect(result.note.notes).toBe('rest well')
    expect(formatDuration(result.durationMs)).toBe('10 min')
  })

  test('falls back to the nearest token when token_id is not set yet', () => {
    const result = resolveAppointmentCheckup(
      { id: 'apt1', doctor_id: 'doc1', patient_id: 'p1', created_at: '2026-11-03T12:00:00Z' },
      {
        tokens: [
          { id: 'tokOld', doctor_id: 'doc1', token: '101', created_at: '2026-10-01T09:00:00Z' },
          { id: 'tokNear', doctor_id: 'doc1', token: '105', created_at: '2026-11-03T12:00:05Z' },
        ],
        notes: [{ doctor_id: 'doc1', token: '105', notes: 'matched' }],
      },
    )
    expect(result.tokenNumber).toBe('105')
    expect(result.note.notes).toBe('matched')
  })

  test('does not cross-match another doctor or another patient', () => {
    const result = resolveAppointmentCheckup(
      { id: 'apt1', doctor_id: 'doc1', patient_id: 'p1', created_at: '2026-11-03T12:00:00Z' },
      {
        tokens: [
          { id: 'tokOtherDoc', doctor_id: 'doc2', token: '105', patient_id: 'p1', created_at: '2026-11-03T12:00:01Z' },
          { id: 'tokOtherPat', doctor_id: 'doc1', token: '105', patient_id: 'p9', created_at: '2026-11-03T12:00:01Z' },
        ],
        notes: [{ doctor_id: 'doc2', token: '105', notes: 'not mine' }],
      },
    )
    expect(result.tokenNumber).toBeNull()
    expect(result.note).toBeNull()
  })

  test('returns an empty shell when nothing is linked', () => {
    const result = resolveAppointmentCheckup({ id: 'apt1' }, {})
    expect(result).toMatchObject({ token: null, tokenNumber: null, note: null, durationMs: null })
  })
})
