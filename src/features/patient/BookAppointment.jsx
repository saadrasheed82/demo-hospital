import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { generateNextToken } from '../../shared/utils/tokenGenerator'

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [token, setToken] = useState('')
  const [doctor] = useState(TEST_DOCTORS.find(d => d.id === doctorId) || TEST_DOCTORS[0])

  const handleConfirm = () => {
    const nextToken = generateNextToken(null)
    setToken(nextToken)
    setStep(2)
  }

  if (step === 2) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Booking Confirmed</h1>
        <div className="bg-green-50 border border-green-200 rounded p-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800">Appointment Booked!</h2>
          <div className="mt-4 space-y-2">
            <p className="text-gray-600">Token Number:</p>
            <p className="text-4xl font-bold text-green-600">#{token}</p>
            <p className="text-gray-600">Doctor: {doctor.name}</p>
            <p className="text-gray-600">Specialty: {doctor.specialty}</p>
            <p className="text-gray-600">Fee: ${doctor.fee}</p>
          </div>
          <button
            onClick={() => navigate('/patient')}
            className="mt-6 w-full bg-green-600 text-white py-2 rounded"
          >
            Track My Queue
          </button>
        </div>
      </div>
    )
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
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Your Name</label>
            <input
              type="text"
              placeholder="Full name"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Phone Number</label>
            <input
              type="tel"
              placeholder="+92 300 1234567"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700"
        >
          Confirm Booking — Pay ${doctor.fee}
        </button>
      </div>
    </div>
  )
}
