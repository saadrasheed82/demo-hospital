import { createContext, useContext } from 'react'

// STUB — full implementation in Task 2
export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={{ user: null, login: () => {}, logout: () => {} }}>
      {children}
    </AuthContext.Provider>
  )
}
