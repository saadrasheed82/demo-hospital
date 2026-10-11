import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './auth/LoginPage'
import { ProtectedRoute } from './auth/ProtectedRoute'
import StaffLayout from './features/staff/StaffLayout'
import LiveQueue from './features/staff/LiveQueue'
import BookAppointment from './features/staff/BookAppointment'
import DoctorLayout from './features/doctor/DoctorLayout'
import DoctorDashboard from './features/doctor/DoctorDashboard'
import DoctorHistory from './features/doctor/DoctorHistory'
import AdminLayout from './features/admin/AdminLayout'
import AdminDashboard from './features/admin/Dashboard'
import DoctorsPage from './features/admin/DoctorsPage'
import StaffPage from './features/admin/StaffPage'
import SchedulePage from './features/admin/SchedulePage'
import AnalyticsPage from './features/admin/AnalyticsPage'
import ConfigPage from './features/admin/ConfigPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="config" element={<ConfigPage />} />
      </Route>

      {/* Staff Routes */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['staff']}>
          <StaffLayout />
        </ProtectedRoute>
      }>
        <Route index element={<LiveQueue />} />
        <Route path="queue" element={<LiveQueue />} />
        <Route path="book" element={<BookAppointment />} />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DoctorDashboard />} />
        <Route path="history" element={<DoctorHistory />} />
      </Route>

      {/* Patient Routes */}
      <Route path="/patient" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Patient Dashboard</h1>
            <p className="text-gray-600 mt-2">Patient dashboard is under development.</p>
          </div>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}
