import { supabase, isSupabaseActive } from '../supabase'

// Generate a unique id for new records when the form doesn't supply one.
const makeId = (prefix) => `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

// ─── GENERIC HEALTH CHECK ────────────────────────────────────────────────────
export const getConnectionStatus = () => ({
  isActive: isSupabaseActive,
  type: isSupabaseActive ? 'supabase' : 'demo',
})

// ─── DOCTORS ─────────────────────────────────────────────────────────────────
export const doctorsService = {
  getAll: async () => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase.from('doctors').select('*')
    if (error) { console.error('Error fetching doctors:', error); return [] }
    return data || []
  },

  subscribe: (callback) => {
    if (!isSupabaseActive) return () => {}
    const subscription = supabase
      .channel('doctors-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => {
        doctorsService.getAll().then(callback)
      })
      .subscribe()
    doctorsService.getAll().then(callback)
    return () => { subscription.unsubscribe() }
  },

  get: async (id) => {
    if (!isSupabaseActive) return null
    const { data, error } = await supabase.from('doctors').select('*').eq('id', id).single()
    if (error) return null
    return data
  },

  create: async (doctor) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const record = doctor.id ? doctor : { ...doctor, id: makeId('doc') }
    const { data, error } = await supabase.from('doctors').insert(record).select().single()
    if (error) throw error
    return data
  },

  update: async (id, updates) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { data, error } = await supabase.from('doctors').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { error } = await supabase.from('doctors').delete().eq('id', id)
    if (error) throw error
  },

  getBySpecialty: async (specialty) => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase.from('doctors').select('*').eq('specialty', specialty)
    if (error) { console.error('Error fetching doctors by specialty:', error); return [] }
    return data || []
  },

  getByEmail: async (email) => {
    if (!isSupabaseActive) return null
    const { data, error } = await supabase.from('doctors').select('*').eq('email', String(email || '').toLowerCase()).single()
    if (error || !data) return null
    return data
  },
}

// ─── STAFF ───────────────────────────────────────────────────────────────────
export const staffService = {
  getAll: async () => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase.from('staff').select('*')
    if (error) { console.error('Error fetching staff:', error); return [] }
    return data || []
  },

  subscribe: (callback) => {
    if (!isSupabaseActive) return () => {}
    const subscription = supabase
      .channel('staff-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
        staffService.getAll().then(callback)
      })
      .subscribe()
    staffService.getAll().then(callback)
    return () => { subscription.unsubscribe() }
  },

  create: async (staff) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const record = staff.id ? staff : { ...staff, id: makeId('staff') }
    const { data, error } = await supabase.from('staff').insert(record).select().single()
    if (error) throw error
    return data
  },

  getByEmail: async (email) => {
    if (!isSupabaseActive) return null
    const { data, error } = await supabase.from('staff').select('*').eq('email', String(email || '').toLowerCase()).single()
    if (error || !data) return null
    return data
  },

  update: async (id, updates) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { data, error } = await supabase.from('staff').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { error } = await supabase.from('staff').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── PATIENTS ────────────────────────────────────────────────────────────────
export const patientsService = {
  getAll: async () => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase.from('patients').select('*')
    if (error) { console.error('Error fetching patients:', error); return [] }
    return data || []
  },

  subscribe: (callback) => {
    if (!isSupabaseActive) return () => {}
    const subscription = supabase
      .channel('patients-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        patientsService.getAll().then(callback)
      })
      .subscribe()
    patientsService.getAll().then(callback)
    return () => { subscription.unsubscribe() }
  },

  get: async (id) => {
    if (!isSupabaseActive) return null
    const { data, error } = await supabase.from('patients').select('*').eq('id', id).single()
    if (error) return null
    return data
  },

  getByEmail: async (email) => {
    if (!isSupabaseActive) return null
    const { data, error } = await supabase.from('patients').select('*').eq('email', email).single()
    if (error || !data) return null
    return data
  },

  create: async (patient) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const record = patient.id ? patient : { ...patient, id: makeId('pat') }
    const { data, error } = await supabase.from('patients').insert(record).select().single()
    if (error) throw error
    return data
  },

  update: async (id, updates) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { data, error } = await supabase.from('patients').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { error } = await supabase.from('patients').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── APPOINTMENTS ────────────────────────────────────────────────────────────
export const appointmentsService = {
  getAll: async (dateFilter = null) => {
    if (!isSupabaseActive) return []
    let q = supabase.from('appointments').select('*')
    if (dateFilter) {
      q = q.eq('date', dateFilter).order('created_at', { ascending: false })
    } else {
      q = q.order('created_at', { ascending: false })
    }
    const { data, error } = await q
    if (error) { console.error('Error fetching appointments:', error); return [] }
    return data || []
  },

  getByDoctor: async (doctorId) => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data || []
  },

  getByPatient: async (patientId) => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data || []
  },

  create: async (appointment) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const record = appointment.id ? appointment : { ...appointment, id: makeId('apt'), status: appointment.status || 'booked' }
    const { data, error } = await supabase.from('appointments').insert(record).select().single()
    if (error) throw error
    return data
  },

  update: async (id, updates) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── SCHEDULES ───────────────────────────────────────────────────────────────
export const schedulesService = {
  getAll: async () => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase.from('schedules').select('*')
    if (error) { console.error('Error fetching schedules:', error); return [] }
    return data || []
  },

  getByDoctor: async (doctorId) => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase.from('schedules').select('*').eq('doctor_id', doctorId)
    if (error) return []
    return data || []
  },

  subscribe: (callback) => {
    if (!isSupabaseActive) return () => {}
    const subscription = supabase
      .channel('schedules-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => {
        schedulesService.getAll().then(callback)
      })
      .subscribe()
    schedulesService.getAll().then(callback)
    return () => { subscription.unsubscribe() }
  },

  create: async (schedule) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { data, error } = await supabase.from('schedules').upsert(schedule).select().single()
    if (error) throw error
    return data
  },

  update: async (id, updates) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { data, error } = await supabase.from('schedules').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) throw error
  },

  saveAll: async (schedules) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { error } = await supabase.from('schedules').upsert(schedules, { onConflict: 'id' })
    if (error) throw error
  },
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export const settingsService = {
  get: async (key) => {
    if (!isSupabaseActive) return null
    const { data, error } = await supabase.from('settings').select('*').eq('key', key).single()
    if (error || !data) return null
    return data
  },

  save: async (key, value) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { data, error } = await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }).select().single()
    if (error) throw error
    return data
  },
}

// ─── TOKENS ──────────────────────────────────────────────────────────────────
export const tokensService = {
  subscribe: (doctorId, callback) => {
    if (!isSupabaseActive) return () => {}
    const subscription = supabase
      .channel('tokens-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, () => {
        tokensService.getByDoctor(doctorId).then(callback)
      })
      .subscribe()
    tokensService.getByDoctor(doctorId).then(callback)
    return () => { subscription.unsubscribe() }
  },

  getByDoctor: async (doctorId) => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('token', { ascending: true })
    if (error) return []
    return data || []
  },

  getByPatient: async (patientId) => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data || []
  },

  create: async (token) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const record = token.id ? token : { ...token, id: makeId('tok') }
    const { data, error } = await supabase.from('tokens').insert({
      ...record,
      status: record.status || 'pending',
    }).select().single()
    if (error) throw error
    return data
  },

  update: async (id, updates) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { data, error } = await supabase.from('tokens').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const { error } = await supabase.from('tokens').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── CONSULT NOTES ──────────────────────────────────────────────────────────
export const consultNotesService = {
  subscribe: (doctorId, callback) => {
    if (!isSupabaseActive) return () => {}
    const subscription = supabase
      .channel('consult-notes-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consult_notes' }, () => {
        consultNotesService.getByDoctor(doctorId).then(callback)
      })
      .subscribe()
    consultNotesService.getByDoctor(doctorId).then(callback)
    return () => { subscription.unsubscribe() }
  },

  getByDoctor: async (doctorId) => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase
      .from('consult_notes')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data || []
  },

  getByAppointment: async (appointmentId) => {
    if (!isSupabaseActive) return []
    const { data, error } = await supabase
      .from('consult_notes')
      .select('*')
      .eq('appointment_id', appointmentId)
    if (error) return []
    return data || []
  },

  create: async (note) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const record = note.id ? note : { ...note, id: makeId('cn') }
    const { data, error } = await supabase.from('consult_notes').insert(record).select().single()
    if (error) throw error
    return data
  },
}

// ─── USERS (logins — the single source of truth for credentials) ───────────
// SHA-256 hex of a password.
export const hashPassword = async (password) => {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto is not available in this environment')
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// In-memory demo store, used when Supabase is not configured. Seeded with the single admin login.
const ADMIN_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' // sha256('admin123')
const DEMO_USERS_KEY = 'hospital_demo_users'
const seedDemoUsers = () => [
  { id: 'usr_admin', email: 'admin@hospital.com', password_hash: ADMIN_PASSWORD_HASH, role: 'admin', name: 'Hospital Admin' },
]
const loadDemoUsers = () => {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(DEMO_USERS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed
      }
    } catch { /* fall through to seed */ }
  }
  const seeded = seedDemoUsers()
  if (typeof localStorage !== 'undefined') {
    try { localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(seeded)) } catch { /* ignore */ }
  }
  return seeded
}
let demoUsers = loadDemoUsers()
const persistDemoUsers = () => {
  if (typeof localStorage !== 'undefined') {
    try { localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(demoUsers)) } catch { /* ignore */ }
  }
}

export const usersService = {
  getByEmail: async (email) => {
    const normalizedEmail = String(email || '').toLowerCase()
    if (!isSupabaseActive) {
      return demoUsers.find((u) => u.email.toLowerCase() === normalizedEmail) || null
    }
    const { data, error } = await supabase.from('users').select('*').eq('email', normalizedEmail).single()
    if (error || !data) return null
    return data
  },

  // Returns the user row if email + password match, else null.
  verify: async (email, password) => {
    const hash = await hashPassword(password || '')
    const row = await usersService.getByEmail(email)
    if (!row || row.password_hash !== hash) return null
    return row
  },

  list: async () => {
    if (!isSupabaseActive) return demoUsers.map((u) => ({ ...u }))
    const { data, error } = await supabase.from('users').select('*').order('created_at')
    if (error) { console.error('Error fetching users:', error); return [] }
    return data || []
  },

  create: async (account) => {
    if (account.role === 'admin') throw new Error('Admin logins cannot be created here')
    const record = {
      id: account.id || makeId('usr'),
      email: String(account.email || '').toLowerCase(),
      password_hash: await hashPassword(account.password),
      role: account.role,
      name: account.name || null,
    }
    // The users table has no doctor_id/staff_id column: the link lives in the
    // email shared by the login and the doctors/staff row, so nothing extra is
    // put on the users record.
    let linkedDoctorId = null
    let linkedStaffId = null
    if (account.role === 'doctor' && !account.skipDoctorRow) {
      // A doctor login is the source of truth: also create the doctor's record.
      if (!isSupabaseActive) throw new Error('Supabase not connected')
      const existingDoctor = await doctorsService.getByEmail(record.email)
      if (existingDoctor) throw new Error('A doctor with that email already exists')
      linkedDoctorId = (await doctorsService.create({
        name: record.name || record.email,
        specialty: account.specialty || '',
        fee: account.fee || 0,
        room: account.room || '',
        hours: account.hours || '',
        email: record.email,
      })).id
    }
    if (account.role === 'staff') {
      if (!isSupabaseActive) throw new Error('Supabase not connected')
      linkedStaffId = (await staffService.create({
        name: record.name || record.email,
        email: record.email,
        role: 'staff',
      })).id
    }
    if (!isSupabaseActive) {
      if (demoUsers.some((u) => u.email.toLowerCase() === record.email)) {
        throw new Error('A login with that email already exists')
      }
      demoUsers.push(record)
      persistDemoUsers()
      return { ...record }
    }
    try {
      const { data, error } = await supabase.from('users').insert(record).select().single()
      if (error) {
        if (error.code === '23505') throw new Error('A login with that email already exists')
        throw error
      }
      return data
    } catch (err) {
      // Compensation: undo the linked row so a failed login insert never leaves
      // an orphaned doctor/staff record behind.
      if (linkedDoctorId) await doctorsService.delete(linkedDoctorId).catch(() => {})
      if (linkedStaffId) await staffService.delete(linkedStaffId).catch(() => {})
      throw err
    }
  },

  delete: async (id) => {
    if (!isSupabaseActive) {
      const index = demoUsers.findIndex((u) => u.id === id)
      if (index === -1) throw new Error('Login not found')
      if (demoUsers[index].role === 'admin') throw new Error('The admin login cannot be deleted')
      const removed = demoUsers.splice(index, 1)[0]
      persistDemoUsers()
      return removed
    }
    const { data: userRow } = await supabase.from('users').select('*').eq('id', id).single()
    if (!userRow) throw new Error('Login not found')
    if (userRow.role === 'admin') throw new Error('The admin login cannot be deleted')
    // Cascade: remove the underlying record before the login. FKs from
    // schedules/tokens/consult_notes are NO ACTION, so clear those first.
    if (userRow.role === 'doctor') {
      const doctor = await doctorsService.getByEmail(userRow.email)
      if (doctor) {
        const { error: sErr } = await supabase.from('schedules').delete().eq('doctor_id', doctor.id)
        if (sErr) throw sErr
        const { error: tErr } = await supabase.from('tokens').delete().eq('doctor_id', doctor.id)
        if (tErr) throw tErr
        const { error: cErr } = await supabase.from('consult_notes').delete().eq('doctor_id', doctor.id)
        if (cErr) throw cErr
        await doctorsService.delete(doctor.id)
      }
    }
    if (userRow.role === 'staff') {
      const staff = await staffService.getByEmail(userRow.email)
      if (staff) await staffService.delete(staff.id)
    }
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error
  },

  // Link a legacy doctor row (no login yet) to a new login.
  claimDoctor: async (doctorId, email, password, extra = {}) => {
    if (!isSupabaseActive) throw new Error('Supabase not connected')
    const doctor = await doctorsService.get(doctorId)
    if (!doctor) throw new Error('Doctor not found')
    if (doctor.email) throw new Error('This doctor already has a login')
    const normalizedEmail = String(email || '').toLowerCase()
    if (await usersService.getByEmail(normalizedEmail)) throw new Error('A login with that email already exists')
    const updates = { email: normalizedEmail, ...extra }
    const claimed = await doctorsService.update(doctor.id, updates)
    const user = await usersService.create({ role: 'doctor', email: claimed.email, name: claimed.name, password, skipDoctorRow: true })
    return { user, doctor: claimed }
  },
}

// Patient self-service: creates the patient record and a matching login, tied together by email.
export const signupPatientAccount = async ({ name, email, password }) => {
  const user = await usersService.create({ role: 'patient', email, name, password })
  if (isSupabaseActive) {
    const existing = await patientsService.getByEmail(user.email)
    if (!existing) {
      await patientsService.create({ name, email: user.email })
    }
  }
  return user
}

// ─── ADMIN UTILITY: Seed Supabase with demo data ────────────────────────────
export const seedSupabase = async () => {
  if (!isSupabaseActive) throw new Error('Supabase not connected')

  const { TEST_DOCTORS } = await import('../data/seedDoctors')
  const { TEST_STAFF } = await import('../data/seedStaff')
  const { TEST_PATIENTS } = await import('../data/seedPatients')
  const { TEST_SPECIALTIES } = await import('../data/seedDoctors')

  const results = { doctors: 0, staff: 0, patients: 0, schedules: 0, settings: 0, appointments: 0, tokens: 0 }

  for (const docData of TEST_DOCTORS) {
    await supabase.from('doctors').upsert(docData)
    results.doctors++

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for (const day of days) {
      await supabase.from('schedules').upsert({
        id: `${docData.id}_${day}`,
        doctor_id: docData.id,
        day,
        start_time: '09:00',
        end_time: '17:00',
        max_patients: 20,
      })
      results.schedules++
    }
  }

  for (const staffData of TEST_STAFF) {
    await supabase.from('staff').upsert(staffData)
    results.staff++
  }

  for (const patient of TEST_PATIENTS) {
    await supabase.from('patients').upsert(patient)
    results.patients++
  }

  await supabase.from('settings').upsert({ key: 'specialties', value: TEST_SPECIALTIES })
  results.settings++

  await supabase.from('settings').upsert({
    key: 'hospitalInfo',
    value: { name: 'Saad Hospital', address: '123 Medical District', phone: '+92 300 1234567' },
  })
  results.settings++

  // Demo appointments + tokens for the default staff queue (fixed ids so re-seeding is safe)
  const today = new Date().toISOString().split('T')[0]
  for (let i = 0; i < 5; i++) {
    const patient = TEST_PATIENTS[i]
    const paid = i < 4
    await supabase.from('appointments').upsert({
      id: `demo_apt_${i + 1}`,
      doctor_id: 'doc1',
      patient_id: patient.id,
      date: today,
      status: 'booked',
      fee: 50,
      payment_status: paid ? 'paid' : 'unpaid',
    }).then(() => results.appointments++)

    await supabase.from('tokens').upsert({
      id: `demo_tok_${i + 1}`,
      doctor_id: 'doc1',
      token: String(101 + i),
      patient_id: patient.id,
      patient_name: patient.name,
      status: i === 0 ? 'current' : 'pending',
      condition: patient.condition,
      age: patient.age,
      payment_status: paid ? 'paid' : 'unpaid',
    }).then(() => results.tokens++)
  }

  return results
}

export { supabase as supabaseDb }
