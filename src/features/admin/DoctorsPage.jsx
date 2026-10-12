import { useState, useEffect } from 'react'
import { doctorsService } from '../../services/supabase'
import { TEST_DOCTORS, TEST_SPECIALTIES } from '../../data/seedDoctors'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = doctorsService.subscribe((docs) => {
      const sorted = docs.sort((a, b) => a.name.localeCompare(b.name))
      setDoctors(sorted)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return
    try {
      await doctorsService.delete(id)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSave = async (doctorData, editId = null) => {
    setActionLoading(true)
    setError(null)
    try {
      if (editId) {
        await doctorsService.update(editId, doctorData)
      } else {
        await doctorsService.create(doctorData)
      }
      setShowAdd(false)
      setEditingDoctor(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Loading doctors...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Doctors Management</h1>
        <button
          onClick={() => { setEditingDoctor(null); setShowAdd(true) }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Doctor
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
            <th className="p-3 text-left">Specialty</th>
            <th className="p-3 text-left">Fee</th>
            <th className="p-3 text-left">Room</th>
            <th className="p-3 text-left">Hours</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map(doc => (
            <tr key={doc.id} className="border-t">
              <td className="p-3">{doc.name}</td>
              <td className="p-3">{doc.specialty}</td>
              <td className="p-3">${doc.fee}</td>
              <td className="p-3">{doc.room}</td>
              <td className="p-3">{doc.hours}</td>
              <td className="p-3">
                <button
                  onClick={() => { setEditingDoctor(doc); setShowAdd(true) }}
                  className="text-blue-600 mr-2 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {doctors.length === 0 && (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                No doctors found. Add one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showAdd && (
        <DoctorForm
          doctor={editingDoctor}
          specialties={TEST_SPECIALTIES}
          loading={actionLoading}
          onClose={() => { setShowAdd(false); setEditingDoctor(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function DoctorForm({ doctor, specialties, loading, onClose, onSave }) {
  const [name, setName] = useState(doctor?.name || '')
  const [specialty, setSpecialty] = useState(doctor?.specialty || specialties[0])
  const [fee, setFee] = useState(doctor?.fee || '')
  const [room, setRoom] = useState(doctor?.room || '')
  const [hours, setHours] = useState(doctor?.hours || '')

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Name is required')
      return
    }
    onSave({ name, specialty, fee: parseInt(fee) || 0, room, hours })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">
          {doctor ? 'Edit Doctor' : 'Add New Doctor'}
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="number"
            placeholder="Fee ($)"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Working Hours (e.g., 9AM-5PM)"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full p-2 border rounded"
          />
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
