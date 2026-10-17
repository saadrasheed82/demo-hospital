import { useState, useEffect } from 'react'
import { appointmentsService, doctorsService, patientsService, staffService } from '../../services/supabase'
import { EmptyState, Notice, PageHeader, Panel, SkeletonRows, Stat, StatRow } from '../../components/ui'

const EMPTY_REVENUE = [
  { day: 'Mon', revenue: 0 },
  { day: 'Tue', revenue: 0 },
  { day: 'Wed', revenue: 0 },
  { day: 'Thu', revenue: 0 },
  { day: 'Fri', revenue: 0 },
  { day: 'Sat', revenue: 0 },
  { day: 'Sun', revenue: 0 },
]

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalStaff: 0,
    todayAppointments: 0,
    totalRevenue: 0,
    noShowRate: '0%',
    avgWaitTime: '0 min',
    busiestDoctor: 'N/A',
    busiestSpecialty: 'N/A',
  })
  const [revenueData, setRevenueData] = useState(EMPTY_REVENUE)
  const [doctorWorkload, setDoctorWorkload] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)

        const [doctorsList, patientsList, staffList] = await Promise.all([
          doctorsService.getAll(),
          patientsService.getAll(),
          staffService.getAll(),
        ])

        const today = new Date().toISOString().split('T')[0]
        const todayAppts = await appointmentsService.getAll(today)
        const allAppts = await appointmentsService.getAll()

        const revenue = todayAppts
          .filter(a => a.payment_status === 'paid')
          .reduce((sum, a) => sum + (a.fee || 0), 0)

        const noShows = todayAppts.filter(a => a.status === 'no-show' || a.status === 'no_show').length
        const noShowRate = todayAppts.length > 0
          ? `${Math.round((noShows / todayAppts.length) * 100)}%`
          : '0%'

        // Group appointments by doctor for workload
        const doctorMap = {}
        doctorsList.forEach(d => {
          doctorMap[d.id] = { name: d.name, specialty: d.specialty, today: 0, week: 0 }
        })

        todayAppts.forEach(a => {
          if (doctorMap[a.doctor_id]) {
            doctorMap[a.doctor_id].today++
            doctorMap[a.doctor_id].week++
          }
        })

        const workloadList = Object.values(doctorMap)
        const busiestDoc = workloadList.reduce((max, d) => (d.today > max.today ? d : max), { today: 0 })

        // Revenue by weekday (last 7 days)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const revenueByDay = days.map(day => ({ day, revenue: 0 }))

        allAppts.forEach(a => {
          const apptDate = new Date(a.created_at || a.date)
          const dayIndex = apptDate.getDay()
          if (a.payment_status === 'paid' && revenueByDay[dayIndex]) {
            revenueByDay[dayIndex].revenue += a.fee || 0
          }
        })

        setStats({
          totalDoctors: doctorsList.length,
          totalPatients: patientsList.length,
          totalStaff: staffList.length,
          todayAppointments: todayAppts.length,
          totalRevenue: revenue,
          noShowRate,
          avgWaitTime: `${Math.round(todayAppts.length * 2)} min`,
          busiestDoctor: busiestDoc.name || 'N/A',
          busiestSpecialty: busiestDoc.specialty || 'N/A',
        })
        setRevenueData(revenueByDay)
        setDoctorWorkload(workloadList)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div>
        <PageHeader eyebrow="Administration" title="Analytics" />
        <StatRow>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="panel px-md py-sm">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton mt-2xs h-7 w-16" />
            </div>
          ))}
        </StatRow>
        <Panel title="Doctor workload">
          <SkeletonRows rows={4} />
        </Panel>
      </div>
    )
  }

  const peak = Math.max(...revenueData.map(d => d.revenue), 1)

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Analytics"
        meta="Today's throughput, the week's revenue and per-doctor load."
      />

      {error && (
        <div className="mb-md">
          <Notice tone="danger" title="Could not load analytics">{error}</Notice>
        </div>
      )}

      <StatRow>
        <Stat label="Today's visits" value={stats.todayAppointments} foot="Appointments booked today" />
        <Stat label="Revenue today" value={`$${stats.totalRevenue}`} foot="Collected from paid visits" tone="ok" />
        <Stat
          label="No-show rate"
          value={stats.noShowRate}
          foot="Share of today's bookings that did not arrive"
          tone={stats.noShowRate === '0%' ? 'default' : 'danger'}
        />
        <Stat label="Avg wait" value={stats.avgWaitTime} foot="Estimated from today's queue length" />
      </StatRow>

      <div className="grid gap-md lg:grid-cols-3">
        <Panel
          title="Revenue this week"
          meta="Paid appointments, grouped by weekday"
          className="lg:col-span-2"
        >
          {stats.totalRevenue === 0 ? (
            <EmptyState
              title="No revenue recorded this week"
              hint="Paid appointments will roll up here by weekday."
            />
          ) : (
            <div className="space-y-2xs">
              {revenueData.map(d => (
                <div key={d.day} className="flex items-center gap-sm">
                  <span className="label-mono w-10 shrink-0">{d.day}</span>
                  <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-[3px] bg-paper-3">
                    <div
                      className="h-full rounded-[3px] bg-accent transition-[width] duration-300 ease-out"
                      style={{ width: `${Math.max((d.revenue / peak) * 100, d.revenue > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-xs text-ink-2 tnum">${d.revenue}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Roster size">
          <dl className="space-y-xs text-sm">
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Doctors</dt>
              <dd className="font-medium tnum text-ink">{stats.totalDoctors}</dd>
            </div>
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Patients</dt>
              <dd className="font-medium tnum text-ink">{stats.totalPatients}</dd>
            </div>
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Staff</dt>
              <dd className="font-medium tnum text-ink">{stats.totalStaff}</dd>
            </div>
            <div className="flex justify-between gap-sm border-t border-rule pt-xs">
              <dt className="text-ink-3">Busiest today</dt>
              <dd className="text-right font-medium text-ink">{stats.busiestDoctor}</dd>
            </div>
            <div className="flex justify-between gap-sm">
              <dt className="text-ink-3">Specialty</dt>
              <dd className="text-right font-medium text-ink">{stats.busiestSpecialty}</dd>
            </div>
          </dl>
        </Panel>
      </div>

      <Panel title="Doctor workload" meta="Patients seen today and this week" className="mt-md" flush>
        {doctorWorkload.length === 0 ? (
          <EmptyState title="No doctors on the roster" hint="Add doctors to see their workload here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Today</th>
                  <th>This week</th>
                  <th>Load</th>
                </tr>
              </thead>
              <tbody>
                {doctorWorkload.map(doc => {
                  const maxToday = Math.max(...doctorWorkload.map(d => d.today), 1)
                  return (
                    <tr key={doc.id || doc.name}>
                      <td className="cell-strong">{doc.name}</td>
                      <td>{doc.specialty}</td>
                      <td className="tnum">{doc.today}</td>
                      <td className="tnum">{doc.week}</td>
                      <td className="w-40">
                        <div className="h-2 overflow-hidden rounded-[2px] bg-paper-3">
                          <div
                            className="h-full rounded-[2px] bg-accent-line"
                            style={{ width: `${(doc.today / maxToday) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}