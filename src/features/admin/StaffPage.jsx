import { useState, useEffect } from 'react'
import { staffService } from '../../services/supabase'
import { TEST_STAFF } from '../../data/seedStaff'

const ROLES = ['admin', 'staff', 'doctor', 'receptionist', 'nurse']

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from staff?`)) return
    try {
      await staffService.delete(id)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSave = async (staffData, editId = null) => {
    setActionLoading(true)
    setError(null)
    try {
      if (editId) {
        await staffService.update(editId, staffData)
      } else {
        await staffService.create(staffData)
      }
      setShowAdd(false)
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
        <button
          onClick={() => { setEditingStaff(null); setShowAdd(true) }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Staff
        </button>
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
                  onClick={() => { setEditingStaff(s); setShowAdd(true) }}
                  className="text-blue-600 mr-2 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {staff.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No staff members found. Add one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showAdd && (
        <StaffForm
          staff={editingStaff}
          roles={ROLES}
          loading={actionLoading}
          onClose={() => { setShowAdd(false); setEditingStaff(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function StaffForm({ staff, roles, loading, onClose, onSave }) {
  const [name, setName] = useState(staff?.name || '')
  const [email, setEmail] = useState(staff?.email || '')
  const [role, setRole] = useState(staff?.role || 'staff')

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      alert('Name and email are required')
      return
    }
    onSave({ name, email, role })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">
          {staff ? 'Edit Staff' : 'Add New Staff'}
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
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
