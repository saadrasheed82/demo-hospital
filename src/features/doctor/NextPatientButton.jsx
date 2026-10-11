export function NextPatientButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700"
    >
      Next Patient →
    </button>
  )
}
