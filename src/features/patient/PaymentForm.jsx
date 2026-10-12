import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { doctorsService, patientsService, appointmentsService, tokensService } from '../../services/supabase'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { isSupabaseActive } from '../../supabase'

export default function PaymentForm() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      const found = await doctorsService.get(doctorId)
      setDoctor(found || TEST_DOCTORS.find(d => d.id === doctorId) || TEST_DOCTORS[0])
    })()
  }, [doctorId])

  const handlePay = async () => {
    setProcessing(true)
    setError(null)
    try {
      await new Promise(r => setTimeout(r, 800))

      if (isSupabaseActive && user?.email) {
        const patient = await patientsService.getByEmail(user.email)
        if (patient) {
          const unpaid = (await appointmentsService.getByPatient(patient.id))
            .filter(a => a.doctor_id === doctorId && a.payment_status === 'unpaid')
          for (const apt of unpaid) {
            await appointmentsService.update(apt.id, { payment_status: 'paid' })
            const myTokens = await tokensService.getByPatient(patient.id)
            const t = myTokens.find(x => x.doctor_id === doctorId && x.payment_status === 'unpaid')
            if (t) await tokensService.update(t.id, { payment_status: 'paid' })
          }
        }
      }
      setPaid(true)
    } catch (err) {
      setError(err.message)
      setProcessing(false)
    }
  }

  if (paid) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className="text-6xl mb-4">💳 ✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your appointment with {doctor?.name} is confirmed.</p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/patient/booked')}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Track My Queue
          </button>
          <button
            onClick={() => navigate('/patient')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded"
          >
            Home
          </button>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return <p className="text-gray-500">Loading…</p>
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

        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-3 text-sm">{error}</div>}

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
          This is a demo — no real payment is processed{isSupabaseActive ? '. Your booking is marked as paid.' : '.'}
        </p>
      </div>
    </div>
  )
}
