import { useState, useEffect } from 'react'
import { settingsService, seedSupabase } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'

export default function ConfigPage() {
  const [status, setStatus] = useState(null)
  const [seedingDb, setSeedingDb] = useState(false)
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'Saad Hospital',
    address: '123 Medical District',
    phone: '+92 300 1234567',
  })
  const [savingInfo, setSavingInfo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHospitalInfo = async () => {
      try {
        const info = await settingsService.get('hospitalInfo')
        if (info?.value) {
          setHospitalInfo(info.value)
        }
      } catch (err) {
        console.warn('Failed to load hospital info:', err.message)
      }
      setLoading(false)
    }
    loadHospitalInfo()
  }, [])

  const handleSeedDb = async () => {
    setSeedingDb(true)
    setStatus(null)
    try {
      const results = await seedSupabase()
      setStatus({
        type: 'success',
        message: `Seeded Supabase data`,
        results: [
          { role: 'Doctors', created: true, email: `${results.doctors} doctors` },
          { role: 'Staff', created: true, email: `${results.staff} staff` },
          { role: 'Patients', created: true, email: `${results.patients} patients` },
          { role: 'Settings', created: true, email: `${results.settings} settings` },
        ]
      })
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setSeedingDb(false)
    }
  }

  const handleSaveInfo = async () => {
    setSavingInfo(true)
    setStatus(null)
    try {
      await settingsService.save('hospitalInfo', hospitalInfo)
      setStatus({ type: 'success', message: 'Hospital configuration saved' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setSavingInfo(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Loading configuration...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Configuration</h1>

      {status && (
        <div className={`mb-4 p-3 rounded ${
          status.type === 'success'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          <p>{status.message}</p>
          {status.results?.map((r, i) => (
            <p key={i} className="text-sm mt-1">
              • {r.role}: {r.email} {r.created ? '✅' : 'already exists ⚠️'}
            </p>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Supabase Status</h2>
        <p className={`font-mono ${isSupabaseActive ? 'text-green-600' : 'text-red-600'}`}>
          {isSupabaseActive ? '✅ Connected to Supabase' : '⚠️ Demo mode (Supabase not configured)'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Project: qamnxnqkzjziqpnhlrhm
        </p>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Hospital Info</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Hospital Name"
            value={hospitalInfo.name}
            onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
            className="w-full p-2 border rounded"
            disabled={!isSupabaseActive || savingInfo}
          />
          <input
            type="text"
            placeholder="Address"
            value={hospitalInfo.address}
            onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })}
            className="w-full p-2 border rounded"
            disabled={!isSupabaseActive || savingInfo}
          />
          <input
            type="text"
            placeholder="Phone"
            value={hospitalInfo.phone}
            onChange={(e) => setHospitalInfo({ ...hospitalInfo, phone: e.target.value })}
            className="w-full p-2 border rounded"
            disabled={!isSupabaseActive || savingInfo}
          />
        </div>
        <button
          onClick={handleSaveInfo}
          disabled={!isSupabaseActive || savingInfo}
          className={`mt-4 text-white px-6 py-2 rounded ${
            !isSupabaseActive
              ? 'bg-gray-400 cursor-not-allowed'
              : savingInfo
              ? 'bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {savingInfo ? 'Saving...' : 'Save Configuration'}
        </button>
        {!isSupabaseActive && (
          <p className="text-xs text-gray-500 mt-2">
            Save is disabled — connect Supabase to persist configuration.
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Demo Setup</h2>

        <div>
          <button
            onClick={handleSeedDb}
            disabled={seedingDb || !isSupabaseActive}
            className={`text-white px-4 py-2 rounded text-sm ${
              seedingDb || !isSupabaseActive
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {seedingDb ? 'Seeding...' : 'Seed Supabase Data'}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Populates Supabase tables with doctors, staff, patients, schedules, and settings.
          </p>
        </div>

        {!isSupabaseActive && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-yellow-700 text-sm">
              ⚠️ Supabase is not configured. Demo buttons create users in mock mode only.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
