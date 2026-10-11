import { useState } from 'react'
import { TEST_DOCTORS, TEST_SPECIALTIES } from '../../data/seedDoctors'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState(TEST_DOCTORS)
  const [showAdd, setShowAdd] = useState(false)

  const handleDelete = (id) => {
    setDoctors(doctors.filter(d => d.id !== id))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Doctors Management</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Doctor
        </button>
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
                <button className="text-blue-600 mr-2 hover:text-blue-800">Edit</button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAdd && (
        <AddDoctorModal
          specialties={TEST_SPECIALTIES}
          onClose={() => setShowAdd(false)}
          onSave={(newDoc) => {
            setDoctors([...doctors, { ...newDoc, id: `doc${doctors.length + 1}` }])
            setShowAdd(false)
          }}
        />
      )}
    </div>
  )
}

function AddDoctorModal({ specialties, onClose, onSave }) {
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState(specialties[0])
  const [fee, setFee] = useState('')
  const [room, setRoom] = useState('')
  const [hours, setHours] = useState('')

  const handleSubmit = () => {
    onSave({ name, specialty, fee: parseInt(fee), room, hours })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">Add New Doctor</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {specialties.map(s => <option key={s}>{s}</option>)}
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
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
