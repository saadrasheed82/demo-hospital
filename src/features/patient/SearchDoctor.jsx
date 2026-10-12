import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doctorsService, settingsService } from '../../services/supabase'
import { TEST_DOCTORS, TEST_SPECIALTIES } from '../../data/seedDoctors'
import { isSupabaseActive } from '../../supabase'

export default function SearchDoctor() {
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState(TEST_SPECIALTIES)
  const [specialty, setSpecialty] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = doctorsService.subscribe(docs => {
      setDoctors(docs)
      setLoading(false)
    })
    settingsService.get('specialties').then(row => {
      if (row?.value?.length) setSpecialties(row.value)
    })
    return unsub
  }, [])

  const filtered = specialty
    ? doctors.filter(d => d.specialty === specialty)
    : doctors

  if (!isSupabaseActive) {
    return (
      <div>
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-700">
          🎭 Demo mode — database not connected. Showing sample doctors.
        </div>
        <h1 className="text-2xl font-bold mb-2">Find a Doctor</h1>
        <DoctorGrid doctors={TEST_DOCTORS.filter(d => !specialty || d.specialty === specialty)} onBook={id => navigate(`/patient/book/${id}`)} />
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Find a Doctor</h1>
        <p className="text-gray-500">Loading doctors…</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Find a Doctor</h1>
      <p className="text-gray-600 mb-6">Browse by specialty and book your appointment.</p>

      <select
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        className="mb-6 p-2 border rounded w-full max-w-xs"
      >
        <option value="">All Specialties</option>
        {specialties.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No doctors found. Ask an admin to add doctors first.</p>
      ) : (
        <DoctorGrid doctors={filtered} onBook={id => navigate(`/patient/book/${id}`)} />
      )}
    </div>
  )
}

function DoctorGrid({ doctors, onBook }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {doctors.map(doc => (
        <div key={doc.id} className="border rounded shadow bg-white p-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-blue-600 font-bold text-lg">{doc.name[0]}</span>
          </div>
          <h3 className="font-bold text-lg">{doc.name}</h3>
          <p className="text-gray-600">{doc.specialty}</p>
          <p className="font-semibold mt-1">Fee: ${doc.fee}</p>
          <p className="text-sm text-gray-500">Room: {doc.room}</p>
          <p className="text-sm text-gray-500">{doc.hours}</p>
          <button
            onClick={() => onBook(doc.id)}
            className="w-full mt-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Book Now
          </button>
        </div>
      ))}
    </div>
  )
}
