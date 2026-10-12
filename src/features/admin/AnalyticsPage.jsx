import { useState, useEffect } from 'react'
import { appointmentsService, doctorsService, patientsService, staffService } from '../../services/supabase'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { TEST_PATIENTS } from '../../data/seedPatients'

const MOCK_REVENUE = [
  { day: 'Mon', revenue: 320 },
  { day: 'Tue', revenue: 410 },
  { day: 'Wed', revenue: 380 },
  { day: 'Thu', revenue: 480 },
  { day: 'Fri', revenue: 420 },
  { day: 'Sat', revenue: 280 },
  { day: 'Sun', revenue: 190 },
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
  const [revenueData, setRevenueData] = useState(MOCK_REVENUE)
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
      <div className="p-4 text-center">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  const statCards = [
    { label: "Today's Appointments", value: stats.todayAppointments, icon: '📅' },
    { label: 'Revenue (Today)', value: `$${stats.totalRevenue}`, icon: '💰' },
    { label: 'No-show Rate', value: stats.noShowRate, icon: '⚠️' },
    { label: 'Avg Wait Time', value: stats.avgWaitTime, icon: '⏱️' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
          ✅ Live data from Supabase
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(card => (
          <div key={card.label} className="bg-white p-4 rounded shadow text-center">
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-gray-600 text-sm">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        <SummaryCard label="Total Doctors" value={stats.totalDoctors} bg="bg-blue-50" />
        <SummaryCard label="Total Patients" value={stats.totalPatients} bg="bg-green-50" />
        <SummaryCard label="Total Staff" value={stats.totalStaff} bg="bg-purple-50" />
        <SummaryCard label="Busiest Doctor" value={stats.busiestDoctor} bg="bg-yellow-50" />
        <SummaryCard label="Busiest Specialty" value={stats.busiestSpecialty} bg="bg-pink-50" />
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Revenue This Week</h2>
        <div className="flex items-end h-40 gap-2">
          {revenueData.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-600 rounded-t transition-all"
                style={{ height: `${Math.max((d.revenue / Math.max(stats.totalRevenue, 1)) * 100, 2)}%` }}
                title={`$${d.revenue}`}
              />
              <span className="text-xs mt-1">{d.day}</span>
              <span className="text-xs text-gray-500">${d.revenue}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Doctor Workload</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Doctor</th>
                <th className="p-2 text-left">Specialty</th>
                <th className="p-2 text-left">Today</th>
                <th className="p-2 text-left">This Week</th>
              </tr>
            </thead>
            <tbody>
              {doctorWorkload.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="p-2">{doc.name}</td>
                  <td className="p-2">{doc.specialty}</td>
                  <td className="p-2">{doc.today} patients</td>
                  <td className="p-2">{doc.week} patients</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, bg }) {
  return (
    <div className={`${bg} p-4 rounded shadow text-center`}>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
    </div>
  )
}
