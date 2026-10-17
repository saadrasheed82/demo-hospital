import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { doctorsService, patientsService, appointmentsService, tokensService } from '../../services/supabase'
import { generateNextToken } from '../../shared/utils/tokenGenerator'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { isSupabaseActive } from '../../supabase'
import { Button, Field, Notice, PageHeader, Panel, SkeletonPanel } from '../../components/ui'

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [reason, setReason] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    ;(async () => {
      const found = await doctorsService.get(doctorId)
      setDoctor(found || TEST_DOCTORS.find(d => d.id === doctorId) || TEST_DOCTORS[0])
    })()
  }, [doctorId])

  const handleBook = async () => {
    setSaving(true)
    setError(null)
    try {
      const email = user?.email

      // Link the booking to the logged-in patient's record (create it on first visit).
      let patient = email ? await patientsService.getByEmail(email) : null
      if (!patient) {
        if (!name.trim()) throw new Error('Please enter your name so we can create your patient record.')
        patient = await patientsService.create({
          name: name.trim(),
          phone: phone.trim(),
          email,
        })
      } else if (phone.trim()) {
        await patientsService.update(patient.id, { phone: phone.trim() }).catch(() => {})
      }

      const today = new Date().toISOString().split('T')[0]
      await appointmentsService.create({
        doctor_id: doctor.id,
        patient_id: patient.id,
        date: today,
        status: 'booked',
        fee: doctor.fee,
        payment_status: 'unpaid',
      })

      const existing = await tokensService.getByDoctor(doctor.id)
      const maxToken = existing.reduce((max, t) => Math.max(max, parseInt(t.token, 10) || 0), 0)
      const token = await tokensService.create({
        doctor_id: doctor.id,
        token: generateNextToken(maxToken > 0 ? String(maxToken) : null),
        patient_id: patient.id,
        patient_name: patient.name,
        condition: reason.trim(),
        age: patient.age,
        status: 'pending',
        payment_status: 'unpaid',
      })

      setConfirmation({ token: token.token, patientId: patient.id, email })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  /* ── booked: the token is the whole page ──────────────────────────── */
  if (confirmation) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader eyebrow="Patient portal" title="Booking confirmed" />

        <section className="graphite p-md text-center lg:p-lg">
          <p className="label-mono">Your token</p>
          <p className="mt-2xs font-mono text-5xl font-semibold leading-none tracking-tight">
            #{confirmation.token}
          </p>
          <p className="mt-sm text-sm text-graphite-dim">
            {doctor.name} · {doctor.specialty}
          </p>
        </section>

        <Panel title="Appointment details" className="mt-md">
          <dl className="space-y-xs text-sm">
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Doctor</dt>
              <dd className="font-medium text-ink">{doctor.name}</dd>
            </div>
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Specialty</dt>
              <dd className="font-medium text-ink">{doctor.specialty}</dd>
            </div>
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Room</dt>
              <dd className="font-medium text-ink">{doctor.room || '—'}</dd>
            </div>
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Fee</dt>
              <dd className="font-medium tnum text-ink">
                ${doctor.fee} · <span className="text-warn">unpaid</span>
              </dd>
            </div>
          </dl>

          <div className="mt-md flex flex-wrap gap-2xs border-t border-rule pt-md">
            <Button onClick={() => navigate(`/patient/pay/${doctor.id}`)}>
              Pay ${doctor.fee} now
            </Button>
            <Button variant="secondary" onClick={() => navigate('/patient/booked')}>
              Track my queue
            </Button>
          </div>

          {!isSupabaseActive && (
            <p className="mt-sm text-xs text-ink-3">Demo mode — this booking was not saved.</p>
          )}
        </Panel>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader eyebrow="Patient portal" title="Book appointment" />
        <SkeletonPanel label="Loading doctor" />
      </div>
    )
  }

  /* ── booking form + running summary ───────────────────────────────── */
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Patient portal"
        title={`Book with ${doctor.name}`}
        meta="You will receive a token for today's queue as soon as you confirm."
      />

      <div className="grid gap-md lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Panel title="Visit details">
          <div className="space-y-sm">
            <Field
              label="Reason for visit"
              htmlFor="reason"
              hint="A short phrase helps the doctor prepare — e.g. chest pain, routine checkup."
            >
              <input
                id="reason"
                type="text"
                className="input"
                placeholder="Routine checkup"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>

            <Field label="Your name" htmlFor="name" hint="Used for your patient record and queue display.">
              <input
                id="name"
                type="text"
                autoComplete="name"
                className="input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <Field label="Phone number" htmlFor="phone">
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                className="input"
                placeholder="+92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>

            {error && <Notice tone="danger">{error}</Notice>}

            <div className="border-t border-rule pt-sm">
              <Button block onClick={handleBook} loading={saving} loadingLabel="Booking…">
                Confirm booking — ${doctor.fee}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title="Summary" quiet className="lg:sticky lg:top-md lg:self-start">
          <dl className="space-y-xs text-sm">
            <div>
              <dt className="label-mono">Doctor</dt>
              <dd className="mt-3xs font-medium text-ink">{doctor.name}</dd>
            </div>
            <div>
              <dt className="label-mono">Specialty</dt>
              <dd className="mt-3xs font-medium text-ink">{doctor.specialty}</dd>
            </div>
            <div>
              <dt className="label-mono">Room</dt>
              <dd className="mt-3xs font-medium text-ink">{doctor.room || '—'}</dd>
            </div>
            <div>
              <dt className="label-mono">Hours</dt>
              <dd className="mt-3xs font-medium text-ink">{doctor.hours || '—'}</dd>
            </div>
            <div className="border-t border-rule pt-xs">
              <dt className="label-mono">Fee due</dt>
              <dd className="mt-3xs font-display text-lg font-semibold tnum text-ink">${doctor.fee}</dd>
            </div>
          </dl>

          {!isSupabaseActive && (
            <p className="mt-sm text-xs text-ink-3">Demo mode — booking will not be saved.</p>
          )}
        </Panel>
      </div>
    </div>
  )
}