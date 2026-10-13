import { createContext, useContext, useEffect, useState } from 'react'
import { usersService, signupPatientAccount } from '../services/supabase'

export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

const SESSION_KEY = 'hospital_session'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const session = JSON.parse(raw)
        if (session?.email && session?.role) setUser(session)
      }
    } catch {
      // corrupted session — start logged out
    }
    setLoading(false)
  }, [])

  const persist = (session) => {
    setUser(session)
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }

  // Verifies against the users table. Role comes from the row, never the email.
  const login = async (email, password) => {
    const row = await usersService.verify(email, password)
    if (!row) throw new Error('Invalid email or password')
    const session = { id: row.id, email: row.email, name: row.name, role: row.role }
    persist(session)
    return session.role
  }

  // Patient self-service: creates a patients row + a patient login, then signs in.
  const signupPatient = async ({ name, email, password }) => {
    await signupPatientAccount({ name, email, password })
    return login(email, password)
  }

  const logout = () => {
    persist(null)
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, loading, login, signupPatient, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
