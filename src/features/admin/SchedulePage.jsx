import { useState, useEffect, useRef } from 'react'
import { doctorsService, schedulesService } from '../../services/supabase'
import { Button, EmptyState, Notice, PageHeader, Panel, SkeletonRows } from '../../components/ui'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SchedulePage() {
  const [doctors, setDoctors] = useState([])
  const [schedules, setSchedules] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  // The subscribe callbacks need the current roster without re-subscribing.
  const doctorsRef = useRef([])

  useEffect(() => {
    const unsubDoctors = doctorsService.subscribe(docs => {
      doctorsRef.current = docs
      setDoctors(docs)
    })

    const buildFromDoctors = (docs, allSchedules) => {
      const byDoctor = {}
      docs.forEach(doc => {
        byDoctor[doc.id] = WEEKDAYS.map(day => ({
          day,
          startTime: '09:00',
          endTime: '17:00',
          maxPatients: 20,
        }))
      })
      allSchedules.forEach(s => {
        if (!Array.isArray(byDoctor[s.doctor_id])) return
        const idx = byDoctor[s.doctor_id].findIndex(d => d.day === s.day)
        if (idx !== -1) byDoctor[s.doctor_id][idx] = s
      })
      return byDoctor
    }

    const unsubSchedules = schedulesService.subscribe((allSchedules) => {
      setSchedules(buildFromDoctors(doctorsRef.current, allSchedules))
      setLoading(false)
    })

    schedulesService.getAll()
      .then(all => setSchedules(buildFromDoctors(doctorsRef.current, all)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

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
      setSuccess('All schedules saved.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader eyebrow="Administration" title="Schedule" />
        <Panel title="Working hours">
          <SkeletonRows rows={6} />
        </Panel>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Schedule"
        meta="Set daily working hours and the patient cap per doctor."
        actions={
          <Button onClick={handleSaveAll} loading={saving} loadingLabel="Saving…">
            Save all schedules
          </Button>
        }
      />

      {error && (
        <div className="mb-md">
          <Notice tone="danger" title="Could not save schedules">{error}</Notice>
        </div>
      )}
      {success && (
        <div className="mb-md">
          <Notice tone="ok" title="Saved">{success}</Notice>
        </div>
      )}

      {doctors.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No doctors to schedule"
            hint="Add a doctor login first, then set their weekly hours here."
          />
        </div>
      ) : (
        <div className="grid gap-md">
          {doctors.map(doc => (
            <Panel key={doc.id} title={doc.name} meta={doc.specialty} flush>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Starts</th>
                      <th>Ends</th>
                      <th>Max patients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKDAYS.map((day, idx) => {
                      const d = schedules[doc.id]?.[idx] || {
                        day, startTime: '09:00', endTime: '17:00', maxPatients: 20,
                      }
                      return (
                        <tr key={day}>
                          <td className="cell-strong">{day}</td>
                          <td>
                            <input
                              type="time"
                              aria-label={`${day} start time`}
                              className="input tnum w-32"
                              value={d.start_time || d.startTime || '09:00'}
                              onChange={(e) => updateSchedule(doc.id, idx, 'startTime', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              aria-label={`${day} end time`}
                              className="input tnum w-32"
                              value={d.end_time || d.endTime || '17:00'}
                              onChange={(e) => updateSchedule(doc.id, idx, 'endTime', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              aria-label={`${day} max patients`}
                              className="input tnum w-28"
                              value={d.max_patients || d.maxPatients || 20}
                              onChange={(e) => updateSchedule(doc.id, idx, 'maxPatients', parseInt(e.target.value) || 20)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}