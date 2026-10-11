import { TEST_DOCTORS } from '../../data/seedDoctors'
import { TEST_PATIENTS } from '../../data/seedPatients'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded shadow">
          <h3 className="text-gray-600">Doctors</h3>
          <p className="text-2xl font-bold">{TEST_DOCTORS.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <h3 className="text-gray-600">Patients</h3>
          <p className="text-2xl font-bold">{TEST_PATIENTS.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded shadow">
          <h3 className="text-gray-600">Today's Appointments</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="space-y-2">
          <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100">
            Add New Doctor
          </button>
          <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100">
            Create Staff Account
          </button>
          <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100">
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  )
}
