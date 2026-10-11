import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, isFirebaseActive } from '../firebase'

export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

// Demo mode: no real Firebase, work offline for presentation
const DEMO_MODE = !isFirebaseActive

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (DEMO_MODE) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setRole(firebaseUser ? firebaseUser.email?.split('@')[0] : null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    if (DEMO_MODE) {
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
    if (!DEMO_MODE && auth) {
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
