import { test, expect } from 'vitest'
import { TEST_DOCTORS, TEST_SPECIALTIES } from '../src/data/seedDoctors'
import { TEST_PATIENTS } from '../src/data/seedPatients'
import { TEST_STAFF } from '../src/data/seedStaff'

test('seed doctors has 5 doctors with required fields', () => {
  expect(TEST_DOCTORS).toHaveLength(5)
  TEST_DOCTORS.forEach(doc => {
    expect(doc).toHaveProperty('name')
    expect(doc).toHaveProperty('specialty')
    expect(doc).toHaveProperty('fee')
    expect(doc).toHaveProperty('room')
  })
})

test('seed specialties has at least 4 specialties', () => {
  expect(TEST_SPECIALTIES.length).toBeGreaterThanOrEqual(4)
})

test('seed patients has at least 5 patients', () => {
  expect(TEST_PATIENTS.length).toBeGreaterThanOrEqual(5)
})

test('seed staff has counter staff accounts', () => {
  expect(TEST_STAFF.length).toBeGreaterThanOrEqual(1)
  TEST_STAFF.forEach(staff => {
    expect(staff).toHaveProperty('email')
    expect(staff).toHaveProperty('password')
    expect(staff).toHaveProperty('role', 'staff')
  })
})

test('seed credentials are valid for demo', () => {
  expect(TEST_DOCTORS).toContainEqual(
    expect.objectContaining({ name: 'Dr. Ahmed' })
  )
})
