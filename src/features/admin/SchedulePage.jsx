import { useState, useEffect } from 'react'
import { doctorsService, schedulesService } from '../../services/supabase'
import { TEST_DOCTORS } from '../../data/seedDoctors'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SchedulePage() {
  const [doctors, setDoctors] = useState([])
  const [schedules, setSchedules] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const unsubDoctors = doctorsService.subscribe(setDoctors)

    const loadSchedules = async () => {
      try {
        const allSchedules = await schedulesService.getAll()
        const byDoctor = {}
        doctors.forEach(doc => {
          byDoctor[doc.id] = WEEKDAYS.map(day => ({
            day,
            startTime: '09:00',
            endTime: '17:00',
            maxPatients: 20,
          }))
        })
        allSchedules.forEach(s => {
          if (!byDoctor[s.doctor_id]) {
            byDoctor[s.doctor_id] = {}
          }
          if (Array.isArray(byDoctor[s.doctor_id])) {
            const idx = byDoctor[s.doctor_id].findIndex(d => d.day === s.day)
            if (idx !== -1) {
              byDoctor[s.doctor_id][idx] = s
            }
          }
        })
        setSchedules(byDoctor)
      } catch (err) {
        setError(err.message)
      }
      setLoading(false)
    }

    const unsubSchedules = schedulesService.subscribe((allSchedules) => {
      const byDoctor = {}
      doctors.forEach(doc => {
        byDoctor[doc.id] = WEEKDAYS.map(day => ({
          day,
          startTime: '09:00',
          endTime: '17:00',
          maxPatients: 20,
        }))
      })
      allSchedules.forEach(s => {
        if (!byDoctor[s.doctor_id]) {
          byDoctor[s.doctor_id] = {}
        }
        if (Array.isArray(byDoctor[s.doctor_id])) {
          const idx = byDoctor[s.doctor_id].findIndex(d => d.day === s.day)
          if (idx !== -1) {
            byDoctor[s.doctor_id][idx] = s
          }
        }
      })
      setSchedules(byDoctor)
      setLoading(false)
    })

    return () => {
      unsubDoctors()
      unsubSchedules()
    }
  }, [])

  const updateSchedule = (doctorId, dayIndex, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [doctorId]: prev[doctorId].map((s, i) =>
        i === dayIndex ? { ...s, [field]: value } : s
      ),
    }))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const operations = []
      for (const doctorId of Object.keys(schedules)) {
        for (const daySchedule of schedules[doctorId]) {
          operations.push(
            schedulesService.create({
              id: `${doctorId}_${daySchedule.day}`,
              doctor_id: doctorId,
              day: daySchedule.day,
              start_time: daySchedule.startTime,
              end_time: daySchedule.endTime,
              max_patients: daySchedule.maxPatients,
            })
          )
        }
      }
      await Promise.all(operations)
      setSuccess('All schedules saved successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Loading schedules...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Schedule Management</h1>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save All Schedules'}
        </button>
      </div>

      <p className="text-gray-600 mb-4">
        Set daily working hours and max patients per slot per doctor.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="mb-4">
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
          ✅ Live data
        </span>
      </div>

      <div className="space-y-4">
        {doctors.map(doc => (
          <div key={doc.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{doc.name} ({doc.specialty})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {WEEKDAYS.map((day, idx) => {
                const d = schedules[doc.id]?.[idx] || { day, startTime: '09:00', endTime: '17:00', maxPatients: 20 }
                return (
                  <div key={day} className="border rounded p-3">
                    <label className="text-sm font-medium text-gray-700 block mb-1">{day}</label>
                    <input
                      type="time"
                      className="w-full p-1 border rounded text-sm mb-1"
                      value={d.start_time || d.startTime || '09:00'}
                      onChange={(e) => updateSchedule(doc.id, idx, 'startTime', e.target.value)}
                    />
                    <input
                      type="time"
                      className="w-full p-1 border rounded text-sm mb-1"
                      value={d.end_time || d.endTime || '17:00'}
                      onChange={(e) => updateSchedule(doc.id, idx, 'endTime', e.target.value)}
                    />
                    <input
                      type="number"
                      className="w-full p-1 border rounded text-sm"
                      placeholder="Max patients"
                      min="1"
                      max="50"
                      value={d.max_patients || d.maxPatients || 20}
                      onChange={(e) => updateSchedule(doc.id, idx, 'maxPatients', parseInt(e.target.value) || 20)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
