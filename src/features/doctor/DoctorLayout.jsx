import { NavLink, Outlet } from 'react-router-dom'

export default function DoctorLayout() {
  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-800 text-white p-4">
        <h2 className="font-bold mb-4 text-lg">Doctor Panel</h2>
        <NavLink
          to="/doctor"
          className="block py-2 px-2 hover:bg-gray-700 rounded"
        >
          My Queue
        </NavLink>
        <NavLink
          to="/doctor/history"
          className="block py-2 px-2 hover:bg-gray-700 rounded"
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
