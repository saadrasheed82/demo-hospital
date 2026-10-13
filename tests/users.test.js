import { test, expect, describe } from 'vitest'
import { hashPassword, usersService } from '../src/services/supabase'

// SHA-256 of 'admin123' (the seeded admin password)
const ADMIN_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'

describe('hashPassword', () => {
  test('produces a 64-char lowercase hex string', async () => {
    const hash = await hashPassword('anything')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  test('is deterministic', async () => {
    expect(await hashPassword('password123')).toBe(await hashPassword('password123'))
  })

  test('different inputs produce different hashes', async () => {
    expect(await hashPassword('a')).not.toBe(await hashPassword('b'))
  })

  test('matches the known admin hash', async () => {
    expect(await hashPassword('admin123')).toBe(ADMIN_HASH)
  })
})

// These run in demo mode (no Supabase env vars): the module falls back to a
// localStorage store seeded with the single admin login. Team account creation
// (doctor/staff) and claims require a live database, so those paths throw.
// The cascade-delete path itself is only reachable against live Supabase and is
// smoke-tested separately, not here.
describe('usersService — team logins invariants', () => {
  test('only the seeded admin login exists in demo mode', async () => {
    const users = await usersService.list()
    expect(users).toHaveLength(1)
    expect(users[0]).toMatchObject({ email: 'admin@hospital.com', role: 'admin' })
  })

  test('the admin login verifies with its seeded password', async () => {
    const row = await usersService.verify('admin@hospital.com', 'admin123')
    expect(row).not.toBeNull()
    expect(row.role).toBe('admin')
  })

  test('no account can be created with role admin', async () => {
    await expect(usersService.create({ role: 'admin', email: 'boss@hospital.com', password: 'anything1' }))
      .rejects.toThrow('Admin logins cannot be created here')
  })

  test('the admin login cannot be deleted', async () => {
    const admin = await usersService.getByEmail('admin@hospital.com')
    await expect(usersService.delete(admin.id)).rejects.toThrow('The admin login cannot be deleted')
  })

  test('doctor logins are only created against a live database', async () => {
    await expect(usersService.create({
      role: 'doctor', name: 'Dr Smoke', email: 'dr.smoke@hospital.com', password: 'secret1',
    })).rejects.toThrow('Supabase not connected')
  })

  test('staff logins are only created against a live database', async () => {
    await expect(usersService.create({
      role: 'staff', name: 'Nurse Smoke', email: 'nurse.smoke@hospital.com', password: 'secret1',
    })).rejects.toThrow('Supabase not connected')
  })

  test('claimDoctor requires a live database', async () => {
    await expect(usersService.claimDoctor('doc1', 'dr.smoke@hospital.com', 'secret1'))
      .rejects.toThrow('Supabase not connected')
  })

  test('duplicate login emails are rejected in demo mode', async () => {
    const email = 'patient.smoke@hospital.com'
    await usersService.create({ role: 'patient', email, password: 'secret1' })
    await expect(usersService.create({ role: 'patient', email, password: 'secret1' }))
      .rejects.toThrow('A login with that email already exists')
  })
})
