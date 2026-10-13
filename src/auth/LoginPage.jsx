import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { isSupabaseActive } from '../supabase'

export default function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login, signupPatient } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const role = await login(email, password)
      navigate(`/${role}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError('Please enter your name')
      return
    }
    setBusy(true)
    setError('')
    try {
      const role = await signupPatient({ name: name.trim(), email, password })
      navigate(`/${role}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-2xl font-bold text-gray-800">Hospital Booking</h1>
          <p className="text-gray-500 text-sm">
            {isSupabaseActive ? 'Sign in to your account' : 'Demo mode — data is not saved between sessions'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3">
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
            <button type="submit" disabled={busy} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300">
              {busy ? 'Signing in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
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
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
              minLength={6}
            />
            <button type="submit" disabled={busy} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300">
              {busy ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        )}

        {error && <p className="text-red-500 text-center text-sm mt-3">{error}</p>}

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError('')
            setName('')
            setPassword('')
          }}
          className="w-full text-sm text-blue-600 hover:underline mt-4"
        >
          {mode === 'login' ? "New patient? Sign up with your email" : "Already have an account? Log in"}
        </button>

        <p className="text-xs text-gray-400 text-center mt-6">
          Staff and doctor logins are created by the hospital administrator.
        </p>
      </div>
    </div>
  )
}
