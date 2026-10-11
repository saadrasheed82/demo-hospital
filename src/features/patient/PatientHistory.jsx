export default function PatientHistory() {
  const MOCK_HISTORY = [
    { token: '098', date: '2026-10-08', doctor: 'Dr. Ahmed', specialty: 'Cardiology', status: 'completed', fee: 50 },
    { token: '072', date: '2026-09-25', doctor: 'Dr. Fatima', specialty: 'General Medicine', status: 'completed', fee: 20 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Appointment History</h1>
      {MOCK_HISTORY.length === 0 ? (
        <p className="text-gray-500">No appointments yet.</p>
      ) : (
        <div className="space-y-3">
          {MOCK_HISTORY.map((item, i) => (
            <div key={i} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.doctor}</p>
                <p className="text-gray-500 text-sm">{item.specialty} · {item.date}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">Token #{item.token}</span>
                <p className="font-semibold">${item.fee}</p>
                <span className="text-xs text-green-600">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
