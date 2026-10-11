import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TEST_DOCTORS } from '../../data/seedDoctors'

export default function PaymentForm() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const doctor = TEST_DOCTORS.find(d => d.id === doctorId) || TEST_DOCTORS[0]
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid] = useState(false)

  const handlePay = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setPaid(true)
    }, 2000)
  }

  if (paid) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className="text-6xl mb-4">💳 ✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your appointment with {doctor.name} is confirmed.</p>
        <button
          onClick={() => navigate('/patient')}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          View My Appointment
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment</h1>
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <div>
            <p className="font-semibold">{doctor.name}</p>
            <p className="text-gray-500 text-sm">{doctor.specialty}</p>
          </div>
          <p className="text-2xl font-bold">${doctor.fee}</p>
        </div>

        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Card number (demo)"
            className="w-full p-2 border rounded"
            defaultValue="4242 4242 4242 4242"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="MM/YY"
              className="p-2 border rounded"
              defaultValue="12/28"
            />
            <input
              type="text"
              placeholder="CVV"
              className="p-2 border rounded"
              defaultValue="123"
            />
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={processing}
          className={`w-full py-3 rounded font-semibold text-white ${
            processing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {processing ? 'Processing...' : `Pay $${doctor.fee}`}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          This is a demo — no real payment is processed.
        </p>
      </div>
    </div>
  )
}
