import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const menuItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/doctors', label: 'Doctors' },
    { path: '/admin/staff', label: 'Staff' },
    { path: '/admin/schedule', label: 'Schedule' },
    { path: '/admin/analytics', label: 'Analytics' },
    { path: '/admin/config', label: 'Config' },
  ]

  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-800 text-white p-4">
        <h2 className="font-bold mb-4 text-lg">Admin Panel</h2>
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className="block py-2 px-2 hover:bg-gray-700 rounded"
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
