export function ArrivalToggle({ status, onStatusChange }) {
  const options = [
    { value: 'on_way', label: 'On My Way' },
    { value: 'arriving', label: 'Arriving in 5 min' },
    { value: 'arrived', label: 'Arrived' },
  ]

  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onStatusChange(opt.value)}
          className={`px-3 py-2 rounded text-sm ${
            status === opt.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
