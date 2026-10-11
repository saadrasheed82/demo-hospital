import { useState } from 'react'
import { TEST_STAFF } from '../../data/seedStaff'

export default function StaffPage() {
  const [staff, setStaff] = useState(TEST_STAFF)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Add Staff
        </button>
      </div>

      <table className="w-full border-collapse bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(s => (
            <tr key={s.id} className="border-t">
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.email}</td>
              <td className="p-3">{s.role}</td>
              <td className="p-3">
                <button className="text-blue-600 mr-2">Edit</button>
                <button className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
