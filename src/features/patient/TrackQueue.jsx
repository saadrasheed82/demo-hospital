import { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { patientsService, tokensService, doctorsService } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'

export default function TrackQueue() {
  const { user } = useAuth()
  const [myToken, setMyToken] = useState(null)
  const [queue, setQueue] = useState([])
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseActive) {
      setLoading(false)
      return
    }

    const email = user?.email
    if (!email) {
      setLoading(false)
      return
    }

    let active = true
    const load = async () => {
      const patient = await patientsService.getByEmail(email)
      if (!patient) {
        if (active) { setMyToken(null); setLoading(false) }
        return
      }

      // The active token is the most recent non-completed one.
      const mine = await tokensService.getByPatient(patient.id)
      const myTok = mine.find(t => t.status === 'current' || t.status === 'pending') || mine[0] || null
      if (active) setMyToken(myTok)

      if (myTok) {
        const [all, doc] = await Promise.all([
          tokensService.getByDoctor(myTok.doctor_id),
          doctorsService.get(myTok.doctor_id),
        ])
        if (active) {
          setQueue(all)
          setDoctor(doc)
        }
      }
      if (active) setLoading(false)
    }

    load()
    const unsub = tokensService.subscribe(() => load())
    return () => {
      active = false
      unsub()
    }
  }, [user?.email])

  if (!isSupabaseActive) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">My Appointment</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-700">
          🎭 Demo mode — live queue tracking needs a database connection.
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="max-w-2xl"><h1 className="text-2xl font-bold mb-4">My Appointment</h1><p className="text-gray-500">Loading your queue…</p></div>
  }

  if (!myToken) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">My Appointment</h1>
        <div className="bg-white rounded shadow p-6 text-center">
          <div className="text-4xl mb-3">🩺</div>
          <p className="text-gray-600">You have no active appointment.</p>
          <p className="text-sm text-gray-400 mt-1">Book one and it will show up here in real time.</p>
        </div>
      </div>
    )
  }

  // Position = count of tokens ahead of me that are still active.
  const ahead = queue.filter(t =>
    t.id !== myToken.id &&
    (t.status === 'pending' || t.status === 'current') &&
    parseInt(t.token, 10) < parseInt(myToken.token, 10)
  ).length
  const myPosition = ahead + 1
  const total = queue.filter(t => t.status !== 'completed' && t.status !== 'no_show').length

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Appointment</h1>

      <div className="bg-blue-50 border border-blue-200 rounded p-6 mb-6 text-center">
        <p className="text-gray-600 mb-1">Your Token</p>
        <p className="text-5xl font-bold text-blue-600 mb-4">#{myToken.token}</p>
        <div className="flex justify-center gap-6 text-sm">
          <div>
            <p className="text-gray-500">Doctor</p>
            <p className="font-semibold">{doctor?.name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Position</p>
            <p className="font-semibold">{myPosition} of {total}</p>
          </div>
          <div>
            <p className="text-gray-500">Payment</p>
            <p className="font-semibold">{myToken.payment_status === 'paid' ? 'Paid' : 'Unpaid'}</p>
          </div>
        </div>
        {myToken.status === 'current' && (
          <div className="mt-4 inline-block bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full">
            It's your turn — please head to {doctor?.room || 'your room'}
          </div>
        )}
      </div>

      <h2 className="font-semibold mb-3">Live Queue</h2>
      <div className="space-y-2">
        {queue
          .filter(t => t.status !== 'completed')
          .map(t => (
            <div
              key={t.id}
              className={`flex justify-between items-center p-3 rounded ${
                t.id === myToken.id
                  ? 'bg-yellow-100 border-2 border-yellow-400'
                  : t.status === 'current'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-white border'
              }`}
            >
              <div>
                <span className="font-bold">#{t.token}</span>
                <span className="ml-3">{t.patient_name}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                t.status === 'current' ? 'bg-green-100 text-green-800' :
                t.id === myToken.id ? 'bg-yellow-200 text-yellow-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {t.status === 'current' ? 'Being seen' : t.id === myToken.id ? 'Your turn' : 'Waiting'}
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}
