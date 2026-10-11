import { NavLink, Outlet } from 'react-router-dom'

export default function StaffLayout() {
  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-800 text-white p-4">
        <h2 className="font-bold mb-4 text-lg">Counter Staff</h2>
        <NavLink
          to="/staff/queue"
          className="block py-2 px-2 hover:bg-gray-700 rounded"
        >
          Live Queue
        </NavLink>
        <NavLink
          to="/staff/book"
          className="block py-2 px-2 hover:bg-gray-700 rounded"
        >
          Book Appointment
        </NavLink>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
