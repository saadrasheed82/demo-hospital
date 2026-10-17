import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { doctorsService } from '../../services/supabase'
import { TEST_SPECIALTIES } from '../../data/seedDoctors'
import { Button, EmptyState, Field, Modal, Notice, PageHeader, Panel, SkeletonRows, StatusChip } from '../../components/ui'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = doctorsService.subscribe((docs) => {
      const sorted = docs.sort((a, b) => a.name.localeCompare(b.name))
      setDoctors(sorted)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSave = async (doctorData, editId) => {
    setActionLoading(true)
    setError(null)
    try {
      await doctorsService.update(editId, doctorData)
      setEditingDoctor(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Doctors"
        meta="Fees, rooms and working hours for every doctor on the roster."
        actions={
          <Link className="btn btn--secondary" to="/admin/team-logins">
            Team logins
          </Link>
        }
      />

      {error && (
        <div className="mb-md">
          <Notice tone="danger" title="Could not save changes">{error}</Notice>
        </div>
      )}

      <Panel title="Roster" meta={`${doctors.length} ${doctors.length === 1 ? 'doctor' : 'doctors'}`} flush>
        {loading ? (
          <div className="panel-body">
            <SkeletonRows rows={6} />
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No doctors on the roster"
            hint="Create a doctor login on the Team logins page to add a record here."
            action={
              <Link className="btn btn--primary" to="/admin/team-logins">
                Go to team logins
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Fee</th>
                  <th>Room</th>
                  <th>Hours</th>
                  <th>Login</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id}>
                    <td className="cell-strong">{doc.name}</td>
                    <td>{doc.specialty}</td>
                    <td className="tnum">${doc.fee}</td>
                    <td>{doc.room || '—'}</td>
                    <td>{doc.hours || '—'}</td>
                    <td>
                      {doc.email ? (
                        <StatusChip tone="ok">{doc.email}</StatusChip>
                      ) : (
                        <StatusChip tone="warn">No login</StatusChip>
                      )}
                    </td>
                    <td className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditingDoctor(doc)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {editingDoctor && (
        <DoctorForm
          doctor={editingDoctor}
          specialties={TEST_SPECIALTIES}
          loading={actionLoading}
          onClose={() => setEditingDoctor(null)}
          onSave={(data) => handleSave(data, editingDoctor.id)}
        />
      )}
    </div>
  )
}

function DoctorForm({ doctor, specialties, loading, onClose, onSave }) {
  const [specialty, setSpecialty] = useState(doctor?.specialty || specialties[0])
  const [fee, setFee] = useState(doctor?.fee || '')
  const [room, setRoom] = useState(doctor?.room || '')
  const [hours, setHours] = useState(doctor?.hours || '')

  const handleSubmit = () => {
    onSave({ specialty, fee: parseInt(fee) || 0, room, hours })
  }

  return (
    <Modal title={`Edit ${doctor.name}`} meta={doctor.email || 'No login linked'} onClose={onClose}>
      <div className="space-y-sm">
        <Field label="Specialty" htmlFor="doctor-specialty">
          <select
            id="doctor-specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="input"
          >
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Consultation fee" htmlFor="doctor-fee" hint="Charged when the patient books a token.">
          <input
            id="doctor-fee"
            type="number"
            min="0"
            className="input"
            placeholder="e.g. 500"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
        </Field>

        <Field label="Room" htmlFor="doctor-room">
          <input
            id="doctor-room"
            type="text"
            className="input"
            placeholder="e.g. 204"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </Field>

        <Field label="Working hours" htmlFor="doctor-hours">
          <input
            id="doctor-hours"
            type="text"
            className="input"
            placeholder="e.g. 9:00–17:00"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </Field>

        <div className="flex flex-wrap justify-end gap-2xs border-t border-rule pt-sm">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} loadingLabel="Saving…">Save</Button>
        </div>
      </div>
    </Modal>
  )
}