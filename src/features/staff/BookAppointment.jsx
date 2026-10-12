import { useState, useEffect } from 'react'
import { doctorsService, patientsService, appointmentsService, tokensService } from '../../services/supabase'
import { generateNextToken } from '../../shared/utils/tokenGenerator'

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [condition, setCondition] = useState('')
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')
  const [newPatientAge, setNewPatientAge] = useState('')
  const [isNewPatient, setIsNewPatient] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    const unsubDoctors = doctorsService.subscribe(docs => {
      setDoctors(docs)
      if (!selectedDoctor && docs.length) setSelectedDoctor(prev => prev || docs[0]?.id)
    })
    const unsubPatients = patientsService.subscribe(setPatients)
    return () => {
      unsubDoctors()
      unsubPatients()
    }
  }, [])

  const doctor = doctors.find(d => d.id === selectedDoctor)
  const patient = patients.find(p => p.id === selectedPatient)

  const handleReset = () => {
    setCondition('')
    setNewPatientName('')
    setNewPatientPhone('')
    setNewPatientAge('')
    setSelectedPatient('')
    setIsNewPatient(false)
    setConfirmation(null)
    setError(null)
  }

  const handleBook = async () => {
    setSaving(true)
    setError(null)
    try {
      let patientId = ''
      let patientName = ''

      if (isNewPatient) {
        if (!newPatientName.trim()) throw new Error('Patient name is required')
        const created = await patientsService.create({
          name: newPatientName.trim(),
          age: parseInt(newPatientAge, 10) || 0,
          phone: newPatientPhone.trim(),
          condition: condition.trim(),
        })
        patientId = created.id
        patientName = created.name
      } else {
        if (!selectedPatient) throw new Error('Select an existing patient')
        patientId = selectedPatient
        patientName = patient?.name || ''
      }

      const today = new Date().toISOString().split('T')[0]
      await appointmentsService.create({
        doctor_id: selectedDoctor,
        patient_id: patientId,
        date: today,
        status: 'booked',
        fee: doctor?.fee || 0,
        payment_status: 'unpaid',
      })

      const existing = await tokensService.getByDoctor(selectedDoctor)
      const maxToken = existing.reduce((max, t) => Math.max(max, parseInt(t.token, 10) || 0), 0)
      const token = await tokensService.create({
        doctor_id: selectedDoctor,
        token: generateNextToken(maxToken > 0 ? String(maxToken) : null),
        patient_id: patientId,
        patient_name: patientName,
        condition: condition.trim(),
        age: isNewPatient ? (parseInt(newPatientAge, 10) || 0) : patient?.age,
        status: 'pending',
        payment_status: 'unpaid',
      })

      setConfirmation({ token: token.token, doctor, patientName, fee: doctor?.fee })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (confirmation) {
    return (
      <div className="max-w-2xl">
        <div className="bg-green-50 border border-green-200 rounded p-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-4">Appointment Booked!</h2>
          <div className="space-y-2 mb-6">
            <p className="text-gray-600">Token Number</p>
            <p className="text-4xl font-bold text-green-600">#{confirmation.token}</p>
            <p className="text-gray-600">Doctor: {confirmation.doctor?.name}</p>
            <p className="text-gray-600">Patient: {confirmation.patientName}</p>
            <p className="text-gray-600">Fee: ${confirmation.fee}</p>
          </div>
          <button
            onClick={handleReset}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Book Another
          </button>
        </div>
      </div>
    )
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
            <option value="">Choose doctor</option>
            {doctors.map(d => (
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
              {patients.map(p => (
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
          <p><strong>Doctor:</strong> {doctor?.name || '—'}</p>
          <p><strong>Fee:</strong> ${doctor?.fee ?? 0}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        <button
          onClick={handleBook}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )
}
