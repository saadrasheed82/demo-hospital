import { useState, useEffect } from 'react'
import { usersService, doctorsService, staffService } from '../../services/supabase'
import { TEST_SPECIALTIES } from '../../data/seedDoctors'
import { Button, EmptyState, Field, Notice, PageHeader, Panel, SkeletonRows, StatusChip } from '../../components/ui'

const ROLE_TONE = { staff: 'active', doctor: 'ok', admin: 'warn', patient: 'neutral' }

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
  const [pendingRemoval, setPendingRemoval] = useState(null)

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

  const removalMessage = (account) => {
    if (account.role === 'doctor') {
      return `Removing this doctor login also deletes their record, schedules, tokens and consult notes.`
    }
    if (account.role === 'staff') {
      return 'Removing this staff login also deletes their staff record.'
    }
    return 'This login will no longer be able to sign in.'
  }

  const handleDelete = async (account) => {
    setError('')
    setBusy(true)
    try {
      await usersService.delete(account.id)
      setPendingRemoval(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader eyebrow="Administration" title="Team logins" />
        <Panel title="Staff & doctor logins">
          <SkeletonRows rows={5} />
        </Panel>
      </div>
    )
  }

  const teamAccounts = accounts.filter((a) => a.role === 'staff' || a.role === 'doctor')
  const patientAccounts = accounts.filter((a) => a.role === 'patient')
  const adminAccounts = accounts.filter((a) => a.role === 'admin')

  const renderAccount = (a) => (
    <tr key={a.id}>
      <td className="cell-strong">{labelFor(a)}</td>
      <td className="font-mono text-xs">{a.email}</td>
      <td><StatusChip tone={ROLE_TONE[a.role] || 'neutral'}>{a.role}</StatusChip></td>
      {a.role !== 'admin' && (
        <td className="text-right">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setPendingRemoval(a)}
            disabled={busy}
          >
            Remove
          </Button>
        </td>
      )}
    </tr>
  )

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Team logins"
        meta="Staff and doctor accounts are created and removed here. Patients create their own login from the sign-up form."
        actions={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create login'}
          </Button>
        }
      />

      {error && (
        <div className="mb-md">
          <Notice tone="danger" title="Action failed">{error}</Notice>
        </div>
      )}

      {pendingRemoval && (
        <div className="mb-md">
          <Notice tone="danger" title={`Remove login for ${pendingRemoval.email}?`}>
            <p>{removalMessage(pendingRemoval)}</p>
            <div className="mt-sm flex flex-wrap gap-2xs">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(pendingRemoval)}
                loading={busy}
                loadingLabel="Removing…"
              >
                Yes, remove this login
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPendingRemoval(null)}>
                Keep it
              </Button>
            </div>
          </Notice>
        </div>
      )}

      {showForm && (
        <Panel title="Create a login" className="mb-md">
          <form onSubmit={handleCreate} className="grid gap-sm sm:grid-cols-2">
            <Field label="Name" htmlFor="user-name">
              <input
                id="user-name"
                type="text"
                className="input"
                placeholder="e.g. Dr. Ahmed Raza"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>

            <Field label="Email" htmlFor="user-email" hint="Used to sign in.">
              <input
                id="user-email"
                type="email"
                className="input"
                placeholder="name@hospital.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Field>

            <Field label="Password" htmlFor="user-password" hint="At least 6 characters.">
              <input
                id="user-password"
                type="text"
                className="input font-mono"
                placeholder="••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </Field>

            <Field label="Role" htmlFor="user-role">
              <select
                id="user-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input"
              >
                <option value="staff">Staff</option>
                <option value="doctor">Doctor</option>
              </select>
            </Field>

            {form.role === 'doctor' && (
              <>
                <Field label="Specialty" htmlFor="user-specialty">
                  <select
                    id="user-specialty"
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    className="input"
                  >
                    <option value="">Choose a specialty</option>
                    {TEST_SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Fee" htmlFor="user-fee">
                  <input
                    id="user-fee"
                    type="number"
                    min="0"
                    className="input"
                    placeholder="e.g. 500"
                    value={form.fee}
                    onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  />
                </Field>
                <Field label="Room" htmlFor="user-room">
                  <input
                    id="user-room"
                    type="text"
                    className="input"
                    placeholder="e.g. 204"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                  />
                </Field>
                <Field label="Working hours" htmlFor="user-hours">
                  <input
                    id="user-hours"
                    type="text"
                    className="input"
                    placeholder="e.g. 9:00–17:00"
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  />
                </Field>
              </>
            )}

            <div className="sm:col-span-2">
              <Button type="submit" loading={busy} loadingLabel="Creating…">
                Create login
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel
        title="Staff & doctor logins"
        meta={`${teamAccounts.length} ${teamAccounts.length === 1 ? 'account' : 'accounts'}`}
        flush
        className="mb-md"
      >
        {teamAccounts.length === 0 ? (
          <EmptyState
            title="No team logins yet"
            hint="Create a login above and the matching doctor or staff record is created with it."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>{teamAccounts.map(renderAccount)}</tbody>
            </table>
          </div>
        )}
      </Panel>

      {unclaimedDoctors.length > 0 && (
        <Panel
          title="Doctors without a login"
          meta="These records cannot sign in until a login is linked."
          className="mb-md"
          flush
        >
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {unclaimedDoctors.map((d) => (
                  <tr key={d.id}>
                    <td className="cell-strong">{d.name}</td>
                    <td>{d.specialty}</td>
                    <td className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => { setClaimDoctor(d); setClaimForm({ email: '', password: '' }); setError('') }}
                      >
                        Claim
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {claimDoctor && (
            <div className="panel-body border-t border-rule bg-paper-2">
              <Notice tone="warn" title={`Link ${claimDoctor.name} (${claimDoctor.specialty}) to a login`}>
                <form onSubmit={handleClaim} className="mt-sm grid gap-sm sm:grid-cols-2">
                  <Field label="Login email" htmlFor="claim-email">
                    <input
                      id="claim-email"
                      type="email"
                      className="input"
                      placeholder="name@hospital.com"
                      value={claimForm.email}
                      onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="Password" htmlFor="claim-password" hint="At least 6 characters.">
                    <input
                      id="claim-password"
                      type="text"
                      className="input font-mono"
                      placeholder="••••••"
                      value={claimForm.password}
                      onChange={(e) => setClaimForm({ ...claimForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2xs sm:col-span-2">
                    <Button type="submit" loading={busy} loadingLabel="Linking…">
                      Link login
                    </Button>
                    <Button variant="ghost" onClick={() => setClaimDoctor(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Notice>
            </div>
          )}
        </Panel>
      )}

      <Panel
        title="Patient logins"
        meta="Self-registered from the login page"
        flush
        className="mb-md"
      >
        {patientAccounts.length === 0 ? (
          <EmptyState
            title="No patient logins yet"
            hint="Patients sign up themselves, so this list fills as they register."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>{patientAccounts.map(renderAccount)}</tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Administrator" meta="Exactly one, and it cannot be changed here" flush>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>{adminAccounts.map(renderAccount)}</tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}