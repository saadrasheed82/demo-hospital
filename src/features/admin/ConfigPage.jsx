import { useState } from 'react'

export default function ConfigPage() {
  const [config, setConfig] = useState({
    hospitalName: 'Saad Hospital',
    address: '123 Medical District, City',
    phone: '+1 (555) 123-4567',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Configuration</h1>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Hospital Info</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Hospital Name"
            className="w-full p-2 border rounded"
            value={config.hospitalName}
            onChange={(e) => setConfig({ ...config, hospitalName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address"
            className="w-full p-2 border rounded"
            value={config.address}
            onChange={(e) => setConfig({ ...config, address: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            className="w-full p-2 border rounded"
            value={config.phone}
            onChange={(e) => setConfig({ ...config, phone: e.target.value })}
          />
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Demo Controls</h2>
          <button
            onClick={() => alert('Demo data has been reset!')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reset Demo Data
          </button>
        </div>

        <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded">
          Save Configuration
        </button>
      </div>
    </div>
  )
}
