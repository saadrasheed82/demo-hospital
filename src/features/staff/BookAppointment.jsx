import { useState } from 'react'
import { TEST_DOCTORS, TEST_PATIENTS } from '../../data/seedDoctors'
import { generateNextToken } from '../../shared/utils/tokenGenerator'

export default function BookAppointment() {
  const [selectedDoctor, setSelectedDoctor] = useState('doc1')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [condition, setCondition] = useState('')
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')
  const [newPatientAge, setNewPatientAge] = useState('')
  const [isNewPatient, setIsNewPatient] = useState(false)

  const doctor = TEST_DOCTORS.find(d => d.id === selectedDoctor)

  const handleBook = () => {
    const token = generateNextToken(null)
    const patient = isNewPatient
      ? { name: newPatientName, age: parseInt(newPatientAge), phone: newPatientPhone, condition }
      : TEST_PATIENTS.find(p => p.id === selectedPatient)

    alert(`Appointment booked!\nDoctor: ${doctor.name}\nPatient: ${patient.name}\nToken: ${token}\nFee: $${doctor.fee}`)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Book New Appointment</h1>

      <div className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Doctor</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {TEST_DOCTORS.map(d => (
              <option key={d.id} value={d.id}>{d.name} — {d.specialty} (${d.fee})</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!isNewPatient}
              onChange={() => setIsNewPatient(false)}
            />
            Existing Patient
          </label>
          <label className="flex items-center gap-2 mt-1">
            <input
              type="radio"
              checked={isNewPatient}
              onChange={() => setIsNewPatient(true)}
            />
            New Patient
          </label>
        </div>

        {!isNewPatient ? (
          <div className="mb-4">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select patient</option>
              {TEST_PATIENTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}) — {p.phone}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Patient Name"
              value={newPatientName}
              onChange={(e) => setNewPatientName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Age"
              value={newPatientAge}
              onChange={(e) => setNewPatientAge(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newPatientPhone}
              onChange={(e) => setNewPatientPhone(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Reason / Condition</label>
          <input
            type="text"
            placeholder="e.g., Chest pain, Routine checkup"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="bg-gray-50 p-3 rounded mb-4">
          <p><strong>Doctor:</strong> {doctor.name}</p>
          <p><strong>Fee:</strong> ${doctor.fee}</p>
        </div>

        <button
          onClick={handleBook}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  )
}
