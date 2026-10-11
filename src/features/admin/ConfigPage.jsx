import { useState } from 'react'
import { seedInitialUsers } from '../../utils/seedInitialUsers'
import { isFirebaseActive } from '../../firebase'

export default function ConfigPage() {
  const [status, setStatus] = useState(null)
  const [logging, setLogging] = useState(false)

  const handleSeed = async () => {
    setLogging(true)
    setStatus(null)
    try {
      const results = await seedInitialUsers()
      setStatus({ type: 'success', message: `Seeded ${results.length} users`, results })
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setLogging(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Configuration</h1>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Firebase Status</h2>
        <p className={`font-mono ${isFirebaseActive ? 'text-green-600' : 'text-red-600'}`}>
          {isFirebaseActive ? '✅ Connected to Firebase' : '⚠️ Demo mode (Firebase not configured)'}
        </p>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Hospital Info</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Hospital Name"
            defaultValue="Saad Hospital"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Address"
            defaultValue="123 Medical District"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Phone"
            defaultValue="+92 300 1234567"
            className="w-full p-2 border rounded"
          />
        </div>
        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">
          Save Configuration
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Demo Setup</h2>
        <p className="text-gray-600 mb-4">
          Create or reset the demo user accounts in Firebase Authentication.
        </p>
        <button
          onClick={handleSeed}
          disabled={logging}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {logging ? 'Creating...' : 'Seed Demo Users'}
        </button>

        {status && (
          <div className={`mt-4 p-3 rounded ${
            status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <p>{status.message}</p>
            {status.results?.map((r, i) => (
              <p key={i} className="text-sm mt-1">
                • {r.role}: {r.email} {r.created ? '✅' : 'already exists ⚠️'}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
