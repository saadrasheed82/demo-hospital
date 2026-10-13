import { useState, useEffect } from 'react'
import { usersService, doctorsService, staffService } from '../../services/supabase'
import { TEST_SPECIALTIES } from '../../data/seedDoctors'

export default function UsersPage() {
  const [accounts, setAccounts] = useState([])
  const [doctors, setDoctors] = useState([])
  const [staffRows, setStaffRows] = useState([])
  const [unclaimedDoctors, setUnclaimedDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', specialty: '', fee: '', room: '', hours: '' })
  const [claimDoctor, setClaimDoctor] = useState(null)
  const [claimForm, setClaimForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const [users, docs, staffList] = await Promise.all([
        usersService.list(),
        doctorsService.getAll(),
        staffService.getAll(),
      ])
      setAccounts(users)
      setDoctors(docs)
      setStaffRows(staffList)
      setUnclaimedDoctors(docs.filter((d) => !d.email))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.role === 'doctor' && !form.specialty) {
      setError('Pick a specialty for the doctor')
      return
    }
    setBusy(true)
    setError('')
    try {
      await usersService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        specialty: form.specialty,
        fee: form.fee ? parseInt(form.fee) || 0 : 0,
        room: form.room.trim(),
        hours: form.hours.trim(),
      })
      setForm({ name: '', email: '', password: '', role: 'staff', specialty: '', fee: '', room: '', hours: '' })
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleClaim = async (e) => {
    e.preventDefault()
    if (claimForm.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setBusy(true)
    setError('')
    try {
      await usersService.claimDoctor(claimDoctor.id, claimForm.email, claimForm.password, { specialty: claimDoctor.specialty })
      setClaimDoctor(null)
      setClaimForm({ email: '', password: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const doctorForEmail = (email) => doctors.find((d) => d.email?.toLowerCase() === email)
  const staffForEmail = (email) => staffRows.find((s) => s.email?.toLowerCase() === email)

  const labelFor = (a) => {
    if (a.role === 'doctor') {
      const doc = doctorForEmail(a.email)
      return doc ? `${doc.name} (${doc.specialty})` : a.email
    }
    if (a.role === 'staff') {
      const s = staffForEmail(a.email)
      return s ? s.name : a.email
    }
    return a.name || a.email
  }

  const handleDelete = async (account) => {
    const msg = account.role === 'doctor'
      ? `Remove the doctor login for ${account.email}? Their record, schedules, tokens and consult notes will be deleted.`
      : account.role === 'staff'
        ? `Remove the staff login for ${account.email}? Their staff record will be deleted.`
        : `Remove the login for ${account.email}?`
    if (!window.confirm(msg)) return
    setError('')
    setBusy(true)
    try {
      await usersService.delete(account.id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="p-4 text-center"><p className="text-gray-500">Loading logins...</p></div>
  }

  const teamAccounts = accounts.filter((a) => a.role === 'staff' || a.role === 'doctor')
  const patientAccounts = accounts.filter((a) => a.role === 'patient')
  const adminAccounts = accounts.filter((a) => a.role === 'admin')

  const renderAccount = (a) => (
    <tr key={a.id} className="border-b last:border-0">
      <td className="p-2">{labelFor(a)}</td>
      <td className="p-2">{a.email}</td>
      <td className="p-2">
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
          a.role === 'staff' ? 'bg-blue-100 text-blue-700' :
          a.role === 'doctor' ? 'bg-green-100 text-green-700' :
          a.role === 'admin' ? 'bg-purple-100 text-purple-700' :
          'bg-orange-100 text-orange-700'
        }`}>
          {a.role}
        </span>
      </td>
      {a.role !== 'admin' && (
        <td className="p-2 text-right">
          <button onClick={() => handleDelete(a)} className="text-red-600 text-sm hover:underline">
            Remove
          </button>
        </td>
      )}
    </tr>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Team Logins</h1>
      <p className="text-sm text-gray-600 mb-4">
        Staff and doctor accounts are created and removed here only. Patients create their own login from the sign-up form on the login page.
      </p>

      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">{error}</div>}

      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Staff &amp; Doctor Logins</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Create Login'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded">
            <input
              type="text"
              placeholder="Name (e.g. Dr. Ahmed)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="p-2 border border-gray-300 rounded"
              required
            />
            <input
              type="email"
              placeholder="Email (used for login)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="p-2 border border-gray-300 rounded"
              required
            />
            <input
              type="text"
              placeholder="Password (min. 6 characters)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="p-2 border border-gray-300 rounded"
              required
              minLength={6}
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="p-2 border border-gray-300 rounded bg-white"
            >
              <option value="staff">Staff</option>
              <option value="doctor">Doctor</option>
            </select>
            {form.role === 'doctor' && (
              <>
                <select
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="p-2 border border-gray-300 rounded bg-white"
                >
                  <option value="">Specialty…</option>
                  {TEST_SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="Fee ($)"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Room"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Working Hours (e.g. 9AM-5PM)"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  className="p-2 border border-gray-300 rounded"
                />
              </>
            )}
            <button
              type="submit"
              disabled={busy}
              className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {busy ? 'Creating…' : 'Create Login'}
            </button>
          </form>
        )}

        {teamAccounts.length === 0 ? (
          <p className="text-sm text-gray-500">No staff or doctor logins yet — create one above.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {teamAccounts.map(renderAccount)}
            </tbody>
          </table>
        )}
      </div>

      {unclaimedDoctors.length > 0 && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Doctors Without a Login</h2>
          <p className="text-sm text-gray-600 mb-4">
            These doctor records exist but have no login, so they can't access the doctor panel. Claim one to link it to a new login.
          </p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="p-2">Doctor</th>
                <th className="p-2">Specialty</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {unclaimedDoctors.map((d) => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="p-2">{d.name}</td>
                  <td className="p-2">{d.specialty}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => { setClaimDoctor(d); setClaimForm({ email: '', password: '' }); setError('') }}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {claimDoctor && (
            <form onSubmit={handleClaim} className="mt-4 grid grid-cols-2 gap-3 bg-amber-50 border border-amber-200 p-4 rounded">
              <p className="col-span-2 text-sm font-semibold text-amber-800">
                Link {claimDoctor.name} ({claimDoctor.specialty}) to a login
              </p>
              <input
                type="email"
                placeholder="Login email"
                value={claimForm.email}
                onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                placeholder="Password (min. 6 characters)"
                value={claimForm.password}
                onChange={(e) => setClaimForm({ ...claimForm, password: e.target.value })}
                className="p-2 border border-gray-300 rounded"
                required
                minLength={6}
              />
              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {busy ? 'Linking…' : 'Link Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setClaimDoctor(null)}
                  className="text-gray-600 text-sm hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Patient Logins</h2>
        {patientAccounts.length === 0 ? (
          <p className="text-sm text-gray-500">Patients sign up from the login page. No patient logins yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {patientAccounts.map(renderAccount)}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Administrator</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {adminAccounts.map(renderAccount)}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-2">
          There is exactly one administrator login. It cannot be created, changed, or removed from here.
        </p>
      </div>
    </div>
  )
}
