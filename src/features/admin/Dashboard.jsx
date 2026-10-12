import { useState, useEffect } from 'react'
import { doctorsService, patientsService, appointmentsService, schedulesService, settingsService } from '../../services/supabase'
import { TEST_DOCTORS } from '../../data/seedDoctors'
import { TEST_PATIENTS } from '../../data/seedPatients'
import { Link } from 'react-router-dom'

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

  const statCards = [
    { label: 'Doctors', value: stats.doctors, icon: '👨‍⚕️', color: 'blue', link: '/admin/doctors' },
    { label: 'Patients', value: stats.patients, icon: '👥', color: 'green', link: '/admin/staff' },
    { label: "Today's Appointments", value: stats.todayAppointments, icon: '📅', color: 'yellow', link: '/admin/analytics' },
    { label: 'Revenue Today', value: `$${stats.revenue}`, icon: '💰', color: 'purple', link: '/admin/analytics' },
  ]

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {hospitalInfo && (
            <p className="text-gray-600 text-sm">{hospitalInfo.name} — {hospitalInfo.phone}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(card => (
          <Link
            key={card.label}
            to={card.link}
            className={`bg-${card.color}-50 p-4 rounded shadow hover:shadow-md transition-shadow text-center block`}
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <h3 className="text-gray-600 text-sm font-medium">{card.label}</h3>
            <p className={`text-2xl font-bold text-${card.color}-700`}>{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>⚠️</span> No-shows Today
          </h2>
          <p className="text-2xl font-bold text-red-600">{stats.noShows}</p>
          <p className="text-sm text-gray-500">Patients marked as no-show</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>📊</span> System Status
          </h2>
          <p className="text-sm font-medium text-green-600">
            ✅ Live — Connected to Supabase
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => window.location.href = '/admin/doctors'}
            className="p-3 bg-blue-50 rounded text-left hover:bg-blue-100 transition-colors"
          >
            <span className="block font-medium">Add Doctor</span>
            <span className="text-xs text-gray-500">Register a new doctor</span>
          </button>
          <button
            onClick={() => window.location.href = '/admin/staff'}
            className="p-3 bg-purple-50 rounded text-left hover:bg-purple-100 transition-colors"
          >
            <span className="block font-medium">Create Staff</span>
            <span className="text-xs text-gray-500">Add new staff member</span>
          </button>
          <button
            onClick={() => window.location.href = '/admin/analytics'}
            className="p-3 bg-green-50 rounded text-left hover:bg-green-100 transition-colors"
          >
            <span className="block font-medium">View Analytics</span>
            <span className="text-xs text-gray-500">Check revenue & stats</span>
          </button>
        </div>
      </div>
    </div>
  )
}
