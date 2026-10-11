import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading, isDemoMode } = useAuth()

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>
  }

  // Demo mode: allow any role
  if (isDemoMode) {
    return children
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />
  }

  return children
}
