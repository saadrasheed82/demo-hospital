import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEST_DOCTORS, TEST_SPECIALTIES } from '../../data/seedDoctors'

export default function SearchDoctor() {
  const [specialty, setSpecialty] = useState('')
  const navigate = useNavigate()

  const filtered = specialty
    ? TEST_DOCTORS.filter(d => d.specialty === specialty)
    : TEST_DOCTORS

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
        {TEST_SPECIALTIES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => (
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
              onClick={() => navigate(`/patient/book/${doc.id}`)}
              className="w-full mt-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
