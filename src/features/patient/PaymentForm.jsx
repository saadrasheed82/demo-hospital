import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { doctorsService, patientsService, appointmentsService, tokensService } from '../../services/supabase'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { isSupabaseActive } from '../../supabase'
import { Button, EmptyState, Field, Notice, PageHeader, Panel, SkeletonPanel } from '../../components/ui'

export default function PaymentForm() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      const found = await doctorsService.get(doctorId)
      setDoctor(found || TEST_DOCTORS.find(d => d.id === doctorId) || TEST_DOCTORS[0])
    })()
  }, [doctorId])

  const handlePay = async () => {
    setProcessing(true)
    setError(null)
    try {
      await new Promise(r => setTimeout(r, 800))

      if (isSupabaseActive && user?.email) {
        const patient = await patientsService.getByEmail(user.email)
        if (patient) {
          const unpaid = (await appointmentsService.getByPatient(patient.id))
            .filter(a => a.doctor_id === doctorId && a.payment_status === 'unpaid')
          for (const apt of unpaid) {
            await appointmentsService.update(apt.id, { payment_status: 'paid' })
            const myTokens = await tokensService.getByPatient(patient.id)
            const t = myTokens.find(x => x.doctor_id === doctorId && x.payment_status === 'unpaid')
            if (t) await tokensService.update(t.id, { payment_status: 'paid' })
          }
        }
      }
      setPaid(true)
    } catch (err) {
      setError(err.message)
      setProcessing(false)
    }
  }

  if (paid) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader eyebrow="Patient portal" title="Payment" />
        <Panel>
          <EmptyState
            title="Payment recorded"
            hint={`Your appointment with ${doctor?.name || 'the doctor'} is confirmed and your place in the queue is held.`}
            action={
              <div className="flex flex-wrap justify-center gap-2xs">
                <Button onClick={() => navigate('/patient/booked')}>Track my queue</Button>
                <Button variant="secondary" onClick={() => navigate('/patient')}>
                  Find another doctor
                </Button>
              </div>
            }
          />
        </Panel>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader eyebrow="Patient portal" title="Payment" />
        <SkeletonPanel label="Loading payment details" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        eyebrow="Patient portal"
        title="Payment"
        meta="This demo does not process real cards — confirming marks the visit as paid."
      />

      <div className="grid gap-md lg:grid-cols-[minmax(0,1fr)_15rem]">
        <Panel title="Card details">
          <div className="space-y-sm">
            <Field label="Card number" htmlFor="card-number" hint="Demo value pre-filled — no card is charged.">
              <input
                id="card-number"
                type="text"
                inputMode="numeric"
                className="input font-mono"
                defaultValue="4242 4242 4242 4242"
              />
            </Field>

            <div className="grid grid-cols-2 gap-xs">
              <Field label="Expiry" htmlFor="card-expiry">
                <input id="card-expiry" type="text" className="input font-mono" defaultValue="12/28" />
              </Field>
              <Field label="CVV" htmlFor="card-cvv">
                <input id="card-cvv" type="text" inputMode="numeric" className="input font-mono" defaultValue="123" />
              </Field>
            </div>

            {error && <Notice tone="danger">{error}</Notice>}

            <div className="border-t border-rule pt-sm">
              <Button
                block
                onClick={handlePay}
                loading={processing}
                loadingLabel="Processing…"
              >
                Pay ${doctor.fee}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title="Amount due" quiet className="lg:self-start">
          <dl className="space-y-xs text-sm">
            <div>
              <dt className="label-mono">Doctor</dt>
              <dd className="mt-3xs font-medium text-ink">{doctor.name}</dd>
            </div>
            <div>
              <dt className="label-mono">Specialty</dt>
              <dd className="mt-3xs font-medium text-ink">{doctor.specialty}</dd>
            </div>
            <div className="border-t border-rule pt-xs">
              <dt className="label-mono">Total</dt>
              <dd className="mt-3xs font-display text-xl font-semibold tnum text-ink">${doctor.fee}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  )
}