import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { DEMO_CREDENTIALS } from '../data/seedStaff'
import { isFirebaseActive } from '../firebase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isDemoMode } = useAuth()
  const navigate = useNavigate()

  const handleFirebaseLogin = async (e) => {
    e.preventDefault()
    try {
      const role = await login(email, password)
      navigate(`/${role}`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDemoLogin = (role) => {
    login(`${role}@hospital.com`, `${role}123`)
    navigate(`/${role}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-2xl font-bold text-gray-800">Hospital Booking</h1>
          <p className="text-gray-500 text-sm">Appointment Demo System</p>
        </div>

          <>
            {isDemoMode ? (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
                <p className="text-yellow-700 text-sm">🎭 Demo Mode — Select Role Below</p>
              </div>
            ) : isFirebaseActive ? (
              <div className="mb-4 bg-green-50 border border-green-200 rounded p-3 text-center">
                <p className="text-green-700 text-sm">✅ Connected to Firebase — Login with seeded credentials</p>
              </div>
            ) : null}

            {/* Demo quick-login buttons (always available) */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {DEMO_CREDENTIALS.map(c => (
                <button
                  key={c.role}
                  onClick={() => handleDemoLogin(c.role)}
                  className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                    c.role === 'admin' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                    c.role === 'staff' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    c.role === 'doctor' ? 'bg-green-600 text-white hover:bg-green-700' :
                    'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {c.role.charAt(0).toUpperCase() + c.role.slice(1)}
                </button>
              ))}
            </div>

            <div className="text-center text-xs text-gray-400 mb-4">or login with credentials</div>

            <form onSubmit={handleFirebaseLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                Login
              </button>
            </form>

            {error && <p className="text-red-500 text-center text-sm mt-3">{error}</p>}
          </>
        )}

        <div className="mt-6 pt-4 border-t text-xs text-gray-500">
          <p className="font-semibold mb-2">Credentials:</p>
          {DEMO_CREDENTIALS.map(c => (
            <p key={c.role}>
              <strong>{c.role}:</strong> {c.email} / {c.password}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
