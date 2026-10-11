import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase'

export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

// Demo mode: bypass Firebase auth (for local testing without real Firebase config)
const DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'demo-key'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (DEMO_MODE) {
      // In demo mode, no user is logged in yet
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const email = firebaseUser.email
        const detectedRole = email.split('@')[0]
        setRole(detectedRole)
      } else {
        setRole(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    if (DEMO_MODE) {
      // Demo mode: return based on email prefix
      const detectedRole = email.split('@')[0]
      const mockUser = { email, displayName: detectedRole }
      setUser(mockUser)
      setRole(detectedRole)
      return detectedRole
    }
    const userCred = await signInWithEmailAndPassword(auth, email, password)
    const detectedRole = userCred.user.email.split('@')[0]
    setRole(detectedRole)
    return detectedRole
  }

  const logout = async () => {
    if (!DEMO_MODE) {
      await signOut(auth)
    }
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, isDemoMode: DEMO_MODE }}>
      {children}
    </AuthContext.Provider>
  )
}
