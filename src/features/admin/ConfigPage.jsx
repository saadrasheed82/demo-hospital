import { useState, useEffect } from 'react'
import { settingsService, seedSupabase } from '../../services/supabase'
import { isSupabaseActive } from '../../supabase'
import { Button, Field, Notice, PageHeader, Panel, SkeletonRows, StatusChip } from '../../components/ui'

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
        message: 'Sample data seeded',
        results: [
          { role: 'Doctors', detail: `${results.doctors} rows` },
          { role: 'Staff', detail: `${results.staff} rows` },
          { role: 'Patients', detail: `${results.patients} rows` },
          { role: 'Settings', detail: `${results.settings} rows` },
        ],
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
      <div>
        <PageHeader eyebrow="Administration" title="Configuration" />
        <Panel title="Hospital info">
          <SkeletonRows rows={3} />
        </Panel>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Configuration"
        meta="The hospital's name and contact details, and the database connection."
      />

      {status && (
        <div className="mb-md">
          <Notice
            tone={status.type === 'success' ? 'ok' : 'danger'}
            title={status.message}
          >
            {status.results && (
              <dl className="mt-2xs grid grid-cols-2 gap-x-sm gap-y-3xs sm:grid-cols-4">
                {status.results.map((r) => (
                  <div key={r.role}>
                    <dt className="label-mono">{r.role}</dt>
                    <dd className="font-medium tnum text-ink">{r.detail}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Notice>
        </div>
      )}

      <div className="grid gap-md lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="Hospital info" meta="Shown in the admin dashboard header.">
          <div className="space-y-sm">
            <Field label="Hospital name" htmlFor="cfg-name">
              <input
                id="cfg-name"
                type="text"
                className="input"
                placeholder="Hospital name"
                value={hospitalInfo.name}
                onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
                disabled={!isSupabaseActive || savingInfo}
              />
            </Field>

            <Field label="Address" htmlFor="cfg-address">
              <input
                id="cfg-address"
                type="text"
                className="input"
                placeholder="Street, district"
                value={hospitalInfo.address}
                onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })}
                disabled={!isSupabaseActive || savingInfo}
              />
            </Field>

            <Field label="Phone" htmlFor="cfg-phone">
              <input
                id="cfg-phone"
                type="tel"
                className="input"
                placeholder="+92 300 1234567"
                value={hospitalInfo.phone}
                onChange={(e) => setHospitalInfo({ ...hospitalInfo, phone: e.target.value })}
                disabled={!isSupabaseActive || savingInfo}
              />
            </Field>

            <div className="border-t border-rule pt-sm">
              <Button
                onClick={handleSaveInfo}
                disabled={!isSupabaseActive}
                loading={savingInfo}
                loadingLabel="Saving…"
              >
                Save configuration
              </Button>
              {!isSupabaseActive && (
                <p className="field-hint">Saving is disabled until a database is connected.</p>
              )}
            </div>
          </div>
        </Panel>

        <div className="grid gap-md lg:content-start">
          <Panel title="Database">
            <StatusChip tone={isSupabaseActive ? 'ok' : 'danger'}>
              {isSupabaseActive ? 'Connected' : 'Not configured'}
            </StatusChip>
            <p className="mt-sm text-sm text-ink-3">
              {isSupabaseActive
                ? 'Reads and writes go to the live project. Sample data is only needed on a fresh database.'
                : 'Demo mode is active. Data lives in memory and is lost on reload.'}
            </p>
          </Panel>

          <Panel title="Demo setup" meta="Populates doctors, staff, patients and settings.">
            <Button
              variant="secondary"
              onClick={handleSeedDb}
              disabled={!isSupabaseActive}
              loading={seedingDb}
              loadingLabel="Seeding…"
            >
              Seed sample data
            </Button>
            <p className="field-hint">
              Only run this against an empty database — it does not clear existing rows.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}