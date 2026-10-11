import { TEST_DOCTORS } from '../../data/seedDoctors'

export default function SchedulePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Schedule Management</h1>
      <p className="text-gray-600 mb-4">Set daily working hours and max patients per slot per doctor.</p>

      <div className="space-y-4">
        {TEST_DOCTORS.map(doc => (
          <div key={doc.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{doc.name} ({doc.specialty})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div>
                <label className="text-sm text-gray-600">Start Time</label>
                <input type="time" className="w-full p-1 border rounded" defaultValue="09:00" />
              </div>
              <div>
                <label className="text-sm text-gray-600">End Time</label>
                <input type="time" className="w-full p-1 border rounded" defaultValue="17:00" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Max Patients</label>
                <input type="number" className="w-full p-1 border rounded" defaultValue="20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded">
        Save All Schedules
      </button>
    </div>
  )
}
