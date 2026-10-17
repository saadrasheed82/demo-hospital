import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { staffService } from '../../services/supabase'
import { Button, EmptyState, Field, Modal, Notice, PageHeader, Panel, SkeletonRows, StatusChip } from '../../components/ui'

const ROLES = ['staff', 'receptionist', 'nurse']
const ROLE_TONE = { admin: 'active', doctor: 'ok', staff: 'neutral' }

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingStaff, setEditingStaff] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = staffService.subscribe((staffList) => {
      const sorted = staffList.sort((a, b) => a.name.localeCompare(b.name))
      setStaff(sorted)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSave = async (staffData, editId) => {
    setActionLoading(true)
    setError(null)
    try {
      await staffService.update(editId, staffData)
      setEditingStaff(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Staff"
        meta="Names, emails and roles for counter and clinical support staff."
        actions={
          <Link className="btn btn--secondary" to="/admin/team-logins">
            Team logins
          </Link>
        }
      />

      {error && (
        <div className="mb-md">
          <Notice tone="danger" title="Could not save changes">{error}</Notice>
        </div>
      )}

      <Panel title="Staff register" meta={`${staff.length} ${staff.length === 1 ? 'person' : 'people'}`} flush>
        {loading ? (
          <div className="panel-body">
            <SkeletonRows rows={5} />
          </div>
        ) : staff.length === 0 ? (
          <EmptyState
            title="No staff records"
            hint="Create a staff login on the Team logins page to add a record here."
            action={
              <Link className="btn btn--primary" to="/admin/team-logins">
                Go to team logins
              </Link>
            }
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
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td className="cell-strong">{s.name}</td>
                    <td className="font-mono text-xs">{s.email}</td>
                    <td>
                      <StatusChip tone={ROLE_TONE[s.role] || 'neutral'}>{s.role}</StatusChip>
                    </td>
                    <td className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditingStaff(s)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {editingStaff && (
        <StaffForm
          staff={editingStaff}
          roles={ROLES}
          loading={actionLoading}
          onClose={() => setEditingStaff(null)}
          onSave={(data) => handleSave(data, editingStaff.id)}
        />
      )}
    </div>
  )
}

function StaffForm({ staff, roles, loading, onClose, onSave }) {
  const [role, setRole] = useState(staff?.role || 'staff')

  return (
    <Modal title={`Edit ${staff.name}`} meta={`${staff.email} · managed on Team logins`} onClose={onClose}>
      <div className="space-y-sm">
        <Field label="Role" htmlFor="staff-role" hint="Controls what this person can access after signing in.">
          <select
            id="staff-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input"
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        <div className="flex flex-wrap justify-end gap-2xs border-t border-rule pt-sm">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ role })} loading={loading} loadingLabel="Saving…">Save</Button>
        </div>
      </div>
    </Modal>
  )
}