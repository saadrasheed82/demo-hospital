import { test, expect, describe } from 'vitest'
import { patientOnlyGuard } from '../src/config'

describe('patientOnlyGuard', () => {
  test('allows a patient account in patient-only mode', () => {
    expect(patientOnlyGuard('patient', true)).toBeNull()
  })

  test('rejects non-patient roles in patient-only mode', () => {
    for (const role of ['admin', 'staff', 'doctor']) {
      expect(patientOnlyGuard(role, true)).toMatch(/patients only/)
    }
  })

  test('allows every role when patient-only mode is off', () => {
    for (const role of ['admin', 'staff', 'doctor', 'patient']) {
      expect(patientOnlyGuard(role, false)).toBeNull()
    }
  })

  test('rejects a null/unknown role in patient-only mode', () => {
    expect(patientOnlyGuard(null, true)).toMatch(/patients only/)
  })
})
