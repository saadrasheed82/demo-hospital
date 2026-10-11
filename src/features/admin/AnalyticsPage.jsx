import { TEST_DOCTORS } from '../../data/seedDoctors'

const MOCK_STATS = {
  todayAppointments: 12,
  totalRevenue: 480,
  noShowRate: '8%',
  avgWaitTime: '12 min',
  busiestDoctor: 'Dr. Ahmed',
  busiestSpecialty: 'Cardiology'
}

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
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's Appointments" value={MOCK_STATS.todayAppointments} />
        <StatCard label="Revenue (Today)" value={`$${MOCK_STATS.totalRevenue}`} />
        <StatCard label="No-show Rate" value={MOCK_STATS.noShowRate} />
        <StatCard label="Avg Wait Time" value={MOCK_STATS.avgWaitTime} />
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Revenue This Week</h2>
        <div className="flex items-end h-40 gap-2">
          {MOCK_REVENUE.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-600 rounded-t"
                style={{ height: `${(d.revenue / 500) * 100}%` }}
              />
              <span className="text-xs mt-1">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Doctor Workload</h2>
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
            {TEST_DOCTORS.map((doc, i) => (
              <tr key={doc.id} className="border-t">
                <td className="p-2">{doc.name}</td>
                <td className="p-2">{doc.specialty}</td>
                <td className="p-2">{12 - i} patients</td>
                <td className="p-2">{60 - i * 5} patients</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const StatCard = ({ label, value }) => (
  <div className="bg-white p-4 rounded shadow text-center">
    <p className="text-gray-600 text-sm">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
)
