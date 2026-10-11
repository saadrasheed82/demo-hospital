import { NavLink, Outlet } from 'react-router-dom'

export default function PatientLayout() {
  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-blue-800 text-white p-4">
        <h2 className="font-bold mb-4 text-lg">Patient Portal</h2>
        <NavLink
          to="/patient"
          className="block py-2 px-2 hover:bg-blue-700 rounded"
        >
          Find Doctor
        </NavLink>
        <NavLink
          to="/patient/booked"
          className="block py-2 px-2 hover:bg-blue-700 rounded"
        >
          My Appointment
        </NavLink>
        <NavLink
          to="/patient/history"
          className="block py-2 px-2 hover:bg-blue-700 rounded"
        >
          History
        </NavLink>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
