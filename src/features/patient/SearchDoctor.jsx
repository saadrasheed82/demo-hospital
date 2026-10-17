import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doctorsService, settingsService } from '../../services/supabase'
import { TEST_DOCTORS, TEST_SPECIALTIES } from '../../data/seedDoctors'
import { isSupabaseActive } from '../../supabase'
import { Button, EmptyState, Field, Notice, PageHeader, SkeletonPanel } from '../../components/ui'

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

  const source = isSupabaseActive ? doctors : TEST_DOCTORS
  const filtered = specialty ? source.filter(d => d.specialty === specialty) : source

  return (
    <div>
      <PageHeader
        eyebrow="Patient portal"
        title="Find a doctor"
        meta="Browse by specialty, then book a token for today."
      />

      {!isSupabaseActive && (
        <div className="mb-md">
          <Notice tone="warn" title="Demo mode">
            No database is connected, so sample doctors are shown and bookings are not saved.
          </Notice>
        </div>
      )}

      <div className="mb-md max-w-xs">
        <Field label="Specialty" htmlFor="specialty-filter">
          <select
            id="specialty-filter"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="input"
          >
            <option value="">All specialties</option>
            {specialties.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      {isSupabaseActive && loading ? (
        <SkeletonPanel label="Loading doctors" />
      ) : filtered.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No doctors match that specialty"
            hint="Try another specialty, or ask an administrator to add doctors to this list."
          />
        </div>
      ) : (
        <>
          <p className="label-mono mb-xs">
            {filtered.length} {filtered.length === 1 ? 'doctor' : 'doctors'}
          </p>
          <div className="grid gap-sm sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(doc => (
              <article key={doc.id} className="panel flex flex-col">
                <div className="panel-body flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-sm">
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-base font-semibold">{doc.name}</h2>
                      <p className="mt-3xs text-sm text-ink-3">{doc.specialty}</p>
                    </div>
                    <span className="chip tnum shrink-0">${doc.fee}</span>
                  </div>

                  <dl className="mt-md space-y-2xs border-t border-rule pt-sm text-sm">
                    <div className="flex justify-between gap-sm">
                      <dt className="text-ink-3">Room</dt>
                      <dd className="font-medium text-ink-2">{doc.room || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-sm">
                      <dt className="text-ink-3">Hours</dt>
                      <dd className="font-medium text-ink-2">{doc.hours || '—'}</dd>
                    </div>
                  </dl>

                  <Button
                    className="mt-md"
                    block
                    onClick={() => navigate(`/patient/book/${doc.id}`)}
                  >
                    Book with {doc.name.split(' ').slice(-1)[0]}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}