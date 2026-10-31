import { test, expect, describe } from 'vitest'
import {
  AVAILABILITY_OPTIONS,
  availabilityMeta,
  openTokensByDoctor,
  liveQueueLine,
} from '../src/shared/utils/doctorStatus'

describe('AVAILABILITY_OPTIONS', () => {
  test('lists the three supported statuses', () => {
    expect(AVAILABILITY_OPTIONS.map(o => o.value)).toEqual([
      'available',
      'on_break',
      'off_duty',
    ])
  })
})

describe('availabilityMeta', () => {
  test('maps each availability to a tone and label', () => {
    expect(availabilityMeta('available')).toEqual({ tone: 'ok', label: 'Available' })
    expect(availabilityMeta('on_break')).toEqual({ tone: 'warn', label: 'On break' })
    expect(availabilityMeta('off_duty')).toEqual({ tone: 'muted', label: 'Off duty' })
  })

  test('falls back to neutral for unknown or missing values', () => {
    expect(availabilityMeta('weird')).toEqual({ tone: 'neutral', label: 'weird' })
    expect(availabilityMeta(undefined)).toEqual({ tone: 'neutral', label: '—' })
    expect(availabilityMeta(null)).toEqual({ tone: 'neutral', label: '—' })
  })
})

describe('openTokensByDoctor', () => {
  test('groups pending and current tokens per doctor', () => {
    const counts = openTokensByDoctor([
      { doctor_id: 'd1', status: 'pending', token: '101' },
      { doctor_id: 'd1', status: 'pending', token: '102' },
      { doctor_id: 'd1', status: 'current', token: '103' },
      { doctor_id: 'd2', status: 'pending', token: '201' },
      { doctor_id: 'd2', status: 'current', token: '202' },
    ])
    expect(counts.d1).toEqual({ waiting: 2, currentToken: '103' })
    expect(counts.d2).toEqual({ waiting: 1, currentToken: '202' })
  })

  test('leaves out closed tokens', () => {
    const counts = openTokensByDoctor([
      { doctor_id: 'd1', status: 'completed', token: '101' },
      { doctor_id: 'd1', status: 'no-show', token: '102' },
    ])
    expect(counts.d1).toBeUndefined()
  })

  test('tolerates null / empty input', () => {
    expect(openTokensByDoctor(null)).toEqual({})
    expect(openTokensByDoctor([])).toEqual({})
  })

  test('a doctor with only a current token reports zero waiting', () => {
    const counts = openTokensByDoctor([
      { doctor_id: 'd1', status: 'current', token: '101' },
    ])
    expect(counts.d1).toEqual({ waiting: 0, currentToken: '101' })
  })
})

describe('liveQueueLine', () => {
  test('describes a doctor with both a current patient and a queue', () => {
    const counts = openTokensByDoctor([
      { doctor_id: 'd1', status: 'current', token: '104' },
      { doctor_id: 'd1', status: 'pending', token: '105' },
      { doctor_id: 'd1', status: 'pending', token: '106' },
      { doctor_id: 'd1', status: 'pending', token: '107' },
    ])
    expect(liveQueueLine(counts, 'd1')).toBe('Now seeing #104 · 3 waiting')
  })

  test('describes a doctor that is only seeing someone', () => {
    const counts = openTokensByDoctor([
      { doctor_id: 'd1', status: 'current', token: '101' },
    ])
    expect(liveQueueLine(counts, 'd1')).toBe('Now seeing #101')
  })

  test('describes a doctor with only people waiting', () => {
    const counts = openTokensByDoctor([
      { doctor_id: 'd1', status: 'pending', token: '101' },
      { doctor_id: 'd1', status: 'pending', token: '102' },
    ])
    expect(liveQueueLine(counts, 'd1')).toBe('2 waiting')
  })

  test('returns null for a doctor with no open tokens', () => {
    const counts = openTokensByDoctor([
      { doctor_id: 'other', status: 'pending', token: '101' },
    ])
    expect(liveQueueLine(counts, 'd1')).toBeNull()
    expect(liveQueueLine(counts, 'unknown')).toBeNull()
  })
})
