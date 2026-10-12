export function NextPatientButton({ onClick, disabled, label = 'Next Patient →' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400"
    >
      {disabled ? 'Saving…' : label}
    </button>
  )
}
