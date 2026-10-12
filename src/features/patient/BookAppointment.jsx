import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { doctorsService, patientsService, appointmentsService, tokensService } from '../../services/supabase'
import { generateNextToken } from '../../shared/utils/tokenGenerator'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { isSupabaseActive } from '../../supabase'

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [reason, setReason] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    ;(async () => {
      const found = await doctorsService.get(doctorId)
      setDoctor(found || TEST_DOCTORS.find(d => d.id === doctorId) || TEST_DOCTORS[0])
    })()
  }, [doctorId])

  const handleBook = async () => {
    setSaving(true)
    setError(null)
    try {
      const email = user?.email

      // Link the booking to the logged-in patient's record (create it on first visit).
      let patient = email ? await patientsService.getByEmail(email) : null
      if (!patient) {
        if (!name.trim()) throw new Error('Please enter your name so we can create your patient record.')
        patient = await patientsService.create({
          name: name.trim(),
          phone: phone.trim(),
          email,
        })
      } else if (phone.trim()) {
        await patientsService.update(patient.id, { phone: phone.trim() }).catch(() => {})
      }

      const today = new Date().toISOString().split('T')[0]
      await appointmentsService.create({
        doctor_id: doctor.id,
        patient_id: patient.id,
        date: today,
        status: 'booked',
        fee: doctor.fee,
        payment_status: 'unpaid',
      })

      const existing = await tokensService.getByDoctor(doctor.id)
      const maxToken = existing.reduce((max, t) => Math.max(max, parseInt(t.token, 10) || 0), 0)
      const token = await tokensService.create({
        doctor_id: doctor.id,
        token: generateNextToken(maxToken > 0 ? String(maxToken) : null),
        patient_id: patient.id,
        patient_name: patient.name,
        condition: reason.trim(),
        age: patient.age,
        status: 'pending',
        payment_status: 'unpaid',
      })

      setConfirmation({ token: token.token, patientId: patient.id, email })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (confirmation) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Booking Confirmed</h1>
        <div className="bg-green-50 border border-green-200 rounded p-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800">Appointment Booked!</h2>
          <div className="mt-4 space-y-2">
            <p className="text-gray-600">Token Number:</p>
            <p className="text-4xl font-bold text-green-600">#{confirmation.token}</p>
            <p className="text-gray-600">Doctor: {doctor.name}</p>
            <p className="text-gray-600">Specialty: {doctor.specialty}</p>
            <p className="text-gray-600">Fee: ${doctor.fee} — <span className="text-red-600">unpaid</span></p>
          </div>
          <button
            onClick={() => navigate(`/patient/pay/${doctor.id}`)}
            className="mt-6 w-full bg-green-600 text-white py-2 rounded"
          >
            Pay ${doctor.fee} Now
          </button>
          <button
            onClick={() => navigate('/patient/booked')}
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded"
          >
            Track My Queue
          </button>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return <p className="text-gray-500">Loading doctor…</p>
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Book Appointment</h1>
      <div className="bg-white rounded shadow p-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-blue-600 font-bold text-2xl">{doctor.name[0]}</span>
          </div>
          <h2 className="text-xl font-bold">{doctor.name}</h2>
          <p className="text-gray-600">{doctor.specialty}</p>
          <p className="font-semibold text-lg mt-1">${doctor.fee}</p>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Reason for Visit</label>
            <input
              type="text"
              placeholder="e.g., Routine checkup, Chest pain"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Your Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Phone Number</label>
            <input
              type="tel"
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded my-3 text-sm">{error}</div>
        )}

        <button
          onClick={handleBook}
          disabled={saving}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'Booking…' : `Confirm Booking — Pay $${doctor.fee}`}
        </button>

        {!isSupabaseActive && (
          <p className="text-xs text-gray-400 text-center mt-3">
            🎭 Demo mode — booking won't be saved without a database connection.
          </p>
        )}
      </div>
    </div>
  )
}
