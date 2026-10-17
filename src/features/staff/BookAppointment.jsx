import { useState, useEffect } from 'react'
import { doctorsService, patientsService, appointmentsService, tokensService } from '../../services/supabase'
import { generateNextToken } from '../../shared/utils/tokenGenerator'
import { Button, Field, Notice, PageHeader, Panel } from '../../components/ui'

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [condition, setCondition] = useState('')
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')
  const [newPatientAge, setNewPatientAge] = useState('')
  const [isNewPatient, setIsNewPatient] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    const unsubDoctors = doctorsService.subscribe(docs => {
      setDoctors(docs)
      if (!selectedDoctor && docs.length) setSelectedDoctor(prev => prev || docs[0]?.id)
    })
    const unsubPatients = patientsService.subscribe(setPatients)
    return () => {
      unsubDoctors()
      unsubPatients()
    }
  }, [])

  const doctor = doctors.find(d => d.id === selectedDoctor)
  const patient = patients.find(p => p.id === selectedPatient)

  const handleReset = () => {
    setCondition('')
    setNewPatientName('')
    setNewPatientPhone('')
    setNewPatientAge('')
    setSelectedPatient('')
    setIsNewPatient(false)
    setConfirmation(null)
    setError(null)
  }

  const handleBook = async () => {
    setSaving(true)
    setError(null)
    try {
      let patientId = ''
      let patientName = ''

      if (isNewPatient) {
        if (!newPatientName.trim()) throw new Error('Patient name is required')
        const created = await patientsService.create({
          name: newPatientName.trim(),
          age: parseInt(newPatientAge, 10) || 0,
          phone: newPatientPhone.trim(),
          condition: condition.trim(),
        })
        patientId = created.id
        patientName = created.name
      } else {
        if (!selectedPatient) throw new Error('Select an existing patient')
        patientId = selectedPatient
        patientName = patient?.name || ''
      }

      const today = new Date().toISOString().split('T')[0]
      await appointmentsService.create({
        doctor_id: selectedDoctor,
        patient_id: patientId,
        date: today,
        status: 'booked',
        fee: doctor?.fee || 0,
        payment_status: 'unpaid',
      })

      const existing = await tokensService.getByDoctor(selectedDoctor)
      const maxToken = existing.reduce((max, t) => Math.max(max, parseInt(t.token, 10) || 0), 0)
      const token = await tokensService.create({
        doctor_id: selectedDoctor,
        token: generateNextToken(maxToken > 0 ? String(maxToken) : null),
        patient_id: patientId,
        patient_name: patientName,
        condition: condition.trim(),
        age: isNewPatient ? (parseInt(newPatientAge, 10) || 0) : patient?.age,
        status: 'pending',
        payment_status: 'unpaid',
      })

      setConfirmation({ token: token.token, doctor, patientName, fee: doctor?.fee })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  /* ── booked ───────────────────────────────────────────────────────── */
  if (confirmation) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader eyebrow="Counter desk" title="Appointment booked" />

        <section className="graphite p-md text-center lg:p-lg">
          <p className="label-mono">Issued token</p>
          <p className="mt-2xs font-mono text-5xl font-semibold leading-none tracking-tight">
            #{confirmation.token}
          </p>
          <p className="mt-sm text-sm text-graphite-dim">{confirmation.patientName}</p>
        </section>

        <Panel title="Visit details" className="mt-md">
          <dl className="space-y-xs text-sm">
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Doctor</dt>
              <dd className="font-medium text-ink">{confirmation.doctor?.name}</dd>
            </div>
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Patient</dt>
              <dd className="font-medium text-ink">{confirmation.patientName}</dd>
            </div>
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Fee</dt>
              <dd className="font-medium tnum text-ink">
                ${confirmation.fee} · <span className="text-warn">unpaid</span>
              </dd>
            </div>
          </dl>

          <div className="mt-md border-t border-rule pt-md">
            <Button onClick={handleReset}>Book another patient</Button>
          </div>
        </Panel>
      </div>
    )
  }

  /* ── form ─────────────────────────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Counter desk"
        title="Book a walk-in"
        meta="Register the patient, pick the doctor, and issue today's token."
      />

      <div className="grid gap-md lg:grid-cols-[minmax(0,1fr)_16rem]">
        <Panel title="Appointment">
          <div className="space-y-sm">
            <Field label="Doctor" htmlFor="book-doctor">
              <select
                id="book-doctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="input"
              >
                <option value="">Choose a doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} — {d.specialty} (${d.fee})</option>
                ))}
              </select>
            </Field>

            {/* Patient type — a segmented control, not a bare radio pair. */}
            <fieldset>
              <legend className="field-label">Patient</legend>
              <div className="inline-flex rounded-control border border-rule-2 p-3xs">
                {[
                  [false, 'Existing patient'],
                  [true, 'New patient'],
                ].map(([value, label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setIsNewPatient(value)}
                    aria-pressed={isNewPatient === value}
                    className={`rounded-[4px] px-xs py-2xs text-sm transition-colors duration-150 ease-out ${
                      isNewPatient === value
                        ? 'bg-accent-soft font-medium text-accent'
                        : 'text-ink-2 hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            {!isNewPatient ? (
              <Field label="Select patient" htmlFor="book-patient">
                <select
                  id="book-patient"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="input"
                >
                  <option value="">Select an existing patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.age}) — {p.phone}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <div className="space-y-sm">
                <Field label="Patient name" htmlFor="new-name">
                  <input
                    id="new-name"
                    type="text"
                    className="input"
                    placeholder="Full name"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-xs">
                  <Field label="Age" htmlFor="new-age">
                    <input
                      id="new-age"
                      type="number"
                      min="0"
                      className="input"
                      placeholder="e.g. 34"
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(e.target.value)}
                    />
                  </Field>
                  <Field label="Phone" htmlFor="new-phone">
                    <input
                      id="new-phone"
                      type="tel"
                      className="input"
                      placeholder="+92 300 1234567"
                      value={newPatientPhone}
                      onChange={(e) => setNewPatientPhone(e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            )}

            <Field
              label="Reason / condition"
              htmlFor="book-condition"
              hint="Shown to the doctor and on the queue board."
            >
              <input
                id="book-condition"
                type="text"
                className="input"
                placeholder="e.g. Chest pain, routine checkup"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />
            </Field>

            {error && <Notice tone="danger">{error}</Notice>}

            <div className="border-t border-rule pt-sm">
              <Button block onClick={handleBook} loading={saving} loadingLabel="Booking…">
                Confirm booking
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title="Summary" quiet className="lg:sticky lg:top-md lg:self-start">
          <dl className="space-y-xs text-sm">
            <div>
              <dt className="label-mono">Doctor</dt>
              <dd className="mt-3xs font-medium text-ink">{doctor?.name || '—'}</dd>
            </div>
            <div>
              <dt className="label-mono">Specialty</dt>
              <dd className="mt-3xs font-medium text-ink">{doctor?.specialty || '—'}</dd>
            </div>
            <div>
              <dt className="label-mono">Room</dt>
              <dd className="mt-3xs font-medium text-ink">{doctor?.room || '—'}</dd>
            </div>
            <div>
              <dt className="label-mono">Patient</dt>
              <dd className="mt-3xs font-medium text-ink">
                {isNewPatient ? newPatientName || 'New patient' : patient?.name || '—'}
              </dd>
            </div>
            <div className="border-t border-rule pt-xs">
              <dt className="label-mono">Fee due</dt>
              <dd className="mt-3xs font-display text-lg font-semibold tnum text-ink">
                ${doctor?.fee ?? 0}
              </dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  )
}