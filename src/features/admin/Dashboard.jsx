import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { doctorsService, patientsService, appointmentsService, schedulesService, settingsService } from '../../services/supabase'
import { Notice, PageHeader, Panel, SkeletonRows, Stat, StatRow } from '../../components/ui'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    staff: 0,
    todayAppointments: 0,
    revenue: 0,
    noShows: 0,
  })
  const [loading, setLoading] = useState(true)
  const [hospitalInfo, setHospitalInfo] = useState(null)

  useEffect(() => {
    const unsubDoctors = doctorsService.subscribe(setDoctorsCount)
    const unsubPatients = patientsService.subscribe(setPatientsCount)

    const loadAppointments = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const appts = await appointmentsService.getAll(today)
        const revenue = appts
          .filter(a => a.payment_status === 'paid')
          .reduce((sum, a) => sum + (a.fee || 0), 0)
        const noShows = appts.filter(a => a.status === 'no-show' || a.status === 'no_show').length

        setStats(prev => ({
          ...prev,
          todayAppointments: appts.length,
          revenue,
          noShows,
        }))
      } catch (err) {
        console.warn('Failed to load appointments:', err.message)
      }
    }

    loadAppointments()

    const unsubSchedules = schedulesService.subscribe(schedules => {
      setStats(prev => ({ ...prev, staff: schedules.length }))
    })

    const loadHospitalInfo = async () => {
      try {
        const info = await settingsService.get('hospitalInfo')
        if (info?.value) setHospitalInfo(info.value)
      } catch (err) {
        console.warn('Failed to load hospital info:', err.message)
      }
    }
    loadHospitalInfo()

    setLoading(false)

    return () => {
      unsubDoctors()
      unsubPatients()
      unsubSchedules()
    }
  }, [])

  function setDoctorsCount(doctors) {
    setStats(prev => ({ ...prev, doctors: doctors.length }))
  }
  function setPatientsCount(patients) {
    setStats(prev => ({ ...prev, patients: patients.length }))
  }

  const actions = [
    { to: '/admin/doctors', label: 'Doctors', hint: 'Review fees, rooms and working hours' },
    { to: '/admin/team-logins', label: 'Team logins', hint: 'Create staff and doctor accounts' },
    { to: '/admin/schedule', label: 'Schedule', hint: 'Set daily hours and patient caps' },
    { to: '/admin/analytics', label: 'Analytics', hint: 'Revenue, workload and no-show rate' },
  ]

  if (loading) {
    return (
      <div>
        <PageHeader eyebrow="Administration" title="Dashboard" />
        <StatRow>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="panel px-md py-sm">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton mt-2xs h-7 w-16" />
            </div>
          ))}
        </StatRow>
        <Panel title="Today">
          <SkeletonRows rows={3} />
        </Panel>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Dashboard"
        meta={
          hospitalInfo
            ? `${hospitalInfo.name}${hospitalInfo.phone ? ` · ${hospitalInfo.phone}` : ''}`
            : 'Hospital configuration has not been set yet.'
        }
      />

      <StatRow>
        <Stat label="Doctors" value={stats.doctors} foot="Registered on the roster" />
        <Stat label="Patients" value={stats.patients} foot="Records on file" />
        <Stat label="Today's visits" value={stats.todayAppointments} foot="Appointments booked today" />
        <Stat
          label="Revenue today"
          value={`$${stats.revenue}`}
          foot="Collected from paid visits"
          tone="ok"
        />
      </StatRow>

      <div className="grid gap-md lg:grid-cols-3">
        <Panel title="Today" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-sm">
            <div>
              <dt className="label-mono">No-shows</dt>
              <dd className={`mt-3xs font-display text-xl font-semibold tnum ${stats.noShows > 0 ? 'text-danger' : 'text-ink'}`}>
                {stats.noShows}
              </dd>
            </div>
            <div>
              <dt className="label-mono">Revenue</dt>
              <dd className="mt-3xs font-display text-xl font-semibold tnum text-ink">${stats.revenue}</dd>
            </div>
          </dl>

          <div className="mt-md border-t border-rule pt-sm">
            {stats.noShows > 0 ? (
              <Notice tone="warn" title={`${stats.noShows} ${stats.noShows === 1 ? 'patient' : 'patients'} did not arrive`}>
                Counter staff can re-queue a no-show from the Live queue page.
              </Notice>
            ) : (
              <Notice tone="ok" title="No no-shows recorded today">
                Every booked patient has been seen or is still waiting.
              </Notice>
            )}
          </div>
        </Panel>

        <Panel title="Quick actions">
          <ul className="divide-y divide-rule">
            {actions.map(a => (
              <li key={a.to}>
                <Link
                  to={a.to}
                  className="block px-0 py-xs transition-colors duration-150 ease-out hover:text-accent"
                >
                  <span className="block text-sm font-medium text-ink">{a.label}</span>
                  <span className="block text-xs text-ink-3">{a.hint}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}