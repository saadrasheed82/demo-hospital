import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { staffService } from '../../services/supabase'

const ROLES = ['staff', 'receptionist', 'nurse']

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

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Loading staff...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <span className="text-sm text-gray-600">
          Add or remove staff from <NavLink to="/admin/team-logins" className="text-blue-600 hover:underline">Team Logins</NavLink>
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
          ✅ Live data
        </span>
      </div>

      <table className="w-full border-collapse bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(s => (
            <tr key={s.id} className="border-t">
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.email}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  s.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  s.role === 'doctor' ? 'bg-green-100 text-green-800' :
                  s.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {s.role}
                </span>
              </td>
              <td className="p-3">
                <button
                  onClick={() => setEditingStaff(s)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {staff.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No staff members found. Create a staff login on the Team Logins page to add one.
              </td>
            </tr>
          )}
        </tbody>
      </table>

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

  const handleSubmit = () => {
    onSave({ role })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">
          Edit {staff.name}
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {staff.name} · {staff.email}
            <span className="block text-xs text-gray-400 mt-1">Name and email are managed on Team Logins.</span>
          </p>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
