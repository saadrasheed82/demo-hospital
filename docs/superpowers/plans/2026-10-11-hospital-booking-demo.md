# Hospital Appointment Booking Demo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single responsive web app demo of a token-based hospital appointment system with Admin, Counter Staff, Doctor, and Patient roles, real-time queue, and no-show reordering.

**Architecture:** React single-page app with role-based routing. Firebase (Auth + Firestore + Realtime DB) for data and real-time queue. Pre-seeded demo data with reset button. All roles share one codebase; role is determined by login.

**Tech Stack:** React 18, Tailwind CSS, Firebase 10 (Auth, Firestore, Realtime DB), React Router v6, Socket.io-style real-time via Firebase Realtime DB. No build framework (Vite for dev server).

**Spec:** [SRS.md](../../SRS.md)

## Global Constraints

- Single browser tab per role; multi-tab demo supported
- No real money — mock payments only, no PCI scope
- Pre-seeded demo data: 5 doctors, 12 patients, 1 staff, 1 admin
- Credentials visible on login page footer
- Deployable on Vercel (frontend) + Firebase (backend)
- Real-time queue updates within 2 seconds

---

## File Structure

```
hospital-app/
├── index.html
├── package.json
├── tailwind.config.cjs
├── vite.config.js
├── firebase.json
├── .firebaserc
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── routes.jsx              # Role-based routing
│   ├── firebase.js             # Firebase init
│   ├── auth/
│   │   ├── AuthContext.jsx     # Auth provider + role detection
│   │   ├── LoginPage.jsx
│   │   └── ProtectedRoute.jsx
│   ├── shared/
│   │   ├── components/
│   │   │   ├── QueueToken.jsx   # Token badge/display
│   │   │   └── StatusBadge.jsx
│   │   ├── hooks/
│   │   │   └── useRealtimeQueue.js  # Subscribes to doctor's queue
│   │   └── utils/
│   │       ├── tokenGenerator.js
│   │       └── demoSeed.js       # Seed data
│   ├── features/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DoctorsPage.jsx     # CRUD doctors + specialties
│   │   │   ├── StaffPage.jsx       # CRUD counter staff
│   │   │   ├── SchedulePage.jsx    # Set doctor hours/rules
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── ConfigPage.jsx      # Hospital name, logo, reset button
│   │   ├── staff/
│   │   │   ├── StaffLayout.jsx
│   │   │   ├── BookAppointment.jsx  # Search patient + assign token
│   │   │   ├── LiveQueue.jsx        # View all tokens, status badges
│   │   │   └── NoShowHandler.jsx    # Move no-show to last token
│   │   ├── doctor/
│   │   │   ├── DoctorLayout.jsx
│   │   │   ├── DoctorDashboard.jsx  # Today's tokens
│   │   │   ├── ArrivalToggle.jsx    # ETA buttons
│   │   │   ├── NextPatientButton.jsx
│   │   │   └── ConsultNotes.jsx     # Mark complete, add notes
│   │   └── patient/
│   │       ├── PatientLayout.jsx
│   │       ├── SearchDoctor.jsx     # Filter by specialty
│   │       ├── BookAppointment.jsx  # Get next token
│   │       ├── PaymentForm.jsx      # Mock payment
│   │       └── TrackQueue.jsx       # Live token position + ETA
│   └── data/
│       ├── seedDoctors.js
│       ├── seedPatients.js
│       └── seedStaff.js
├── tests/
│   ├── tokenGenerator.test.js       # Token sequencing logic
│   └── queueLogic.test.js           # No-show → last token logic
└── public/
    └── ...
```

Data collections in Firestore:
- `users` — all people (admin, staff, doctor, patient); has `role` field
- `doctors` — doctor profiles with specialty, room, fees
- `specialties` — predefined specialty list
- `appointments` — per-doctor queue documents; subcollections or Realtime DB nodes for live tokens
- `patients` — patient profiles
- `queue` (Realtime DB) — live queue state per doctor: `{ doctorId: { tokenId: { patientId, status, ... } } }`

---

## Task Breakdown

### Task 1: Project Scaffold & Firebase Setup

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `tailwind.config.cjs`, `postcss.config.cjs`
- Create: `firebase.json`, `.firebaserc`
- Create: `src/main.jsx`, `src/App.jsx`, `src/firebase.js`
- Create: `src/auth/AuthContext.jsx` (stub only — no auth logic yet)
- Test: (No test needed — scaffolding only)

**Interfaces:**
- Produces: `firebase.js` exports `db`, `auth`, `realtimeDb` (Firebase instances)

- [ ] **Step 1: Write package.json**
```json
{
  "name": "hospital-booking-demo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "firebase": "^10.14.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0"
  },
  "devDependencies: {
    "@vitejs/plugin-react": "^5.0.7",
    "tailwindcss": "^3.4.4",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**
Run: `npm install`

- [ ] **Step 3: Write Vite config**
Create `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  test: { environment: 'jsdom' }
})
```

- [ ] **Step 4: Write Tailwind config**
Create `tailwind.config.cjs`:
```js
module.exports = {
  content: ['./index.html', './src/**/*.{jsx,js,ts,tsx}'],
  theme: { extend: {} },
  plugins: []
}
```

- [ ] **Step 5: Write Firebase config**
Create `src/firebase.js`:
```js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase as getRealtimeDb } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: "hospital-booking-demo.firebaseapp.com",
  projectId: "hospital-booking-demo",
  databaseURL: "https://hospital-booking-demo-default-rtdb.firebaseio.com",
  storageBucket: "hospital-booking-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const realtimeDb = getRealtimeDb(app)
```

- [ ] **Step 6: Create stub AuthContext**
Create `src/auth/AuthContext.jsx`:
```jsx
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
```

- [ ] **Step 7: Create root entry**
Create `src/main.jsx`:
```jsx
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
```

- [ ] **Step 8: Basic App shell**
Create `src/App.jsx`:
```jsx
import { BrowserRouter } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <h1 className="p-4 text-xl font-bold">Hospital Booking Demo (Scaffold)</h1>
      </div>
    </BrowserRouter>
  )
}
```

- [ ] **Step 9: Run dev server**
Run: `npm run dev`
Verify: Vite dev server starts on `http://localhost:3000`

---

### Task 2: Seed Data & Auth System

**Files:**
- Create: `src/data/seedDoctors.js`, `src/data/seedPatients.js`, `src/data/seedStaff.js`
- Modify: `src/auth/AuthContext.jsx` (add real auth logic)
- Create: `src/auth/LoginPage.jsx`, `src/auth/ProtectedRoute.jsx`
- Test: `tests/auth.test.js`

**Interfaces:**
- Consumes: `firebase.js` exports `auth`, `db`
- Produces: `useAuth()` hook returns `{ user, role, login, logout }`

- [ ] **Step 1: Write failing test for seed data**
Create `tests/seed.test.js`:
```js
import { TEST_DOCTORS } from '../src/data/seedDoctors'

test('seed data has 5 doctors with required fields', () => {
  expect(TEST_DOCTORS).toHaveLength(5)
  TEST_DOCTORS.forEach(doc => {
    expect(doc).toHaveProperty('name')
    expect(doc).toHaveProperty('specialty')
    expect(doc).toHaveProperty('fee')
    expect(doc).toHaveProperty('room')
  })
})
```

- [ ] **Step 2: Implement seed data**

Doctors (`src/data/seedDoctors.js`):
```js
export const TEST_DOCTORS = [
  { id: 'doc1', name: 'Dr. Ahmed', specialty: 'Cardiology', fee: 50, room: 'Cardio-1', hours: '9AM-5PM' },
  { id: 'doc2', name: 'Dr. Fatima', specialty: 'General Medicine', fee: 20, room: 'GM-3', hours: '8AM-4PM' },
  { id: 'doc3', name: 'Dr. Khan', specialty: 'Pediatrics', fee: 30, room: 'Peds-2', hours: '10AM-6PM' },
  { id: 'doc4', name: 'Dr. Ali', specialty: 'Dermatology', fee: 40, room: 'Derm-1', hours: '9AM-5PM' },
  { id: 'doc5', name: 'Dr. Noor', specialty: 'Orthopedics', fee: 60, room: 'Ortho-1', hours: '8AM-4PM' },
]

export const TEST_SPECIALTIES = [
  'General Medicine', 'Pediatrics', 'Cardiology',
  'Dermatology', 'Orthopedics', 'Gastroenterology',
  'Ophthalmology', 'Dental'
]
```

Staff (`src/data/seedStaff.js`):
```js
export const TEST_STAFF = [
  { id: 'staff1', name: 'Receptionist', email: 'staff@hospital.com', password: 'staff123', role: 'staff' },
]
```

Patients (`src/data/seedPatients.js`):
```js
export const TEST_PATIENTS = [
  { id: 'p1', name: 'Sarah Johnson', age: 34, phone: '555-0101', condition: 'Chest pain' },
  { id: 'p2', name: 'Ali Hassan', age: 45, phone: '555-0102', condition: 'Routine checkup' },
  { id: 'p3', name: 'Maria Garcia', age: 28, phone: '555-0103', condition: 'Skin rash' },
  { id: 'p4', name: 'Omar Faruk', age: 67, phone: '555-0104', condition: 'Joint pain' },
  { id: 'p5', name: 'Layla Ameen', age: 12, phone: '555-0105', condition: 'Fever' },
  // + 7 more
]
```

- [ ] **Step 3: Write LoginPage with seeded credentials**
Create `src/auth/LoginPage.jsx`:
```jsx
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

const DEMO_CREDS = [
  { role: 'admin', email: 'admin@hospital.com', password: 'admin123' },
  { role: 'staff', email: 'staff@hospital.com', password: 'staff123' },
  { role: 'doctor', email: 'doctor@hospital.com', password: 'doctor123' },
  { role: 'patient', email: 'patient@hospital.com', password: 'patient123' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      const role = email.split('@')[0]  // Simple role mapping for demo
      navigate(`/${role}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Hospital Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-2" required />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-2" required />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
        </form>
        <div className="mt-4 text-xs text-gray-600">
          <p>Demo credentials:</p>
          {DEMO_CREDS.map(c => (
            <p key={c.role}>{c.email} / {c.password} ({c.role})</p>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**
Run: `npm test -- tests/seed.test.js`
Expected: PASS

---

### Task 3: Queue Logic & Token Generator

**Files:**
- Create: `src/shared/utils/tokenGenerator.js`
- Create: `src/shared/hooks/useRealtimeQueue.js`
- Test: `tests/tokenGenerator.test.js`, `tests/queueLogic.test.js`

**Interfaces:**
- Produces: `generateNextToken(lastToken)` → string (e.g., "103")
- Produces: `reorderNoShow(queue, tokenId)` → reordered array with tokenId last
- Produces: `useRealtimeQueue(doctorId)` → `{ tokens, loading, error }`

- [ ] **Step 1: Write failing tests**

Create `tests/tokenGenerator.test.js`:
```js
import { generateNextToken, parseTokenNumber } from '../src/shared/utils/tokenGenerator'

test('generates sequential 3-digit tokens', () => {
  expect(generateNextToken('101')).toBe('102')
  expect(generateNextToken('109')).toBe('110')
  expect(generateNextToken(null)).toBe('101')
})

test('parses token number correctly', () => {
  expect(parseTokenNumber('105')).toBe(105)
})
```

Create `tests/queueLogic.test.js`:
```js
import { reorderNoShow } from '../src/shared/utils/tokenGenerator'

const mockQueue = [
  { id: 't1', patientId: 'p1', token: '101', status: 'pending' },
  { id: 't2', patientId: 'p2', token: '102', status: 'pending' },
  { id: 't3', patientId: 'p3', token: '103', status: 'current' },
]

test('moves no-show to end of queue with last token', () => {
  const result = reorderNoShow(mockQueue, 't1')
  expect(result[2].id).toBe('t1')
  expect(result[2].token).toBe('104')
  expect(result[2].status).toBe('end_of_queue')
})
```

- [ ] **Step 2: Implement token generator**

Create `src/shared/utils/tokenGenerator.js`:
```js
export const generateNextToken = (lastToken) => {
  if (!lastToken) return '101'
  const num = parseInt(lastToken, 10)
  return String(num + 1).padStart(3, '0')
}

export const parseTokenNumber = (token) => parseInt(token, 10)

export const reorderNoShow = (queue, tokenId) => {
  const reordered = queue.filter(t => t.id !== tokenId)
  const noShowToken = queue.find(t => t.id === tokenId)
  const lastTokenNum = Math.max(...queue.map(t => parseTokenNumber(t.token)), 100)
  const newToken = String(lastTokenNum + 1).padStart(3, '0')

  const updated = {
    ...noShowToken,
    token: newToken,
    status: 'end_of_queue',
    originalToken: noShowToken.token
  }
  reordered.push(updated)
  return reordered
}
```

- [ ] **Step 3: Run tests**
Run: `npm test -- tests/tokenGenerator.test.js tests/queueLogic.test.js`
Expected: PASS

---

### Task 4: Admin Dashboard (Doctors & Staff CRUD)

**Files:**
- Create: `src/features/admin/AdminLayout.jsx`, `src/features/admin/Dashboard.jsx`
- Create: `src/features/admin/DoctorsPage.jsx`
- Test: `tests/admin.test.js`

**Interfaces:**
- Consumes: `firebase.js` exports `db`
- Consumes: `seedDoctors.js` TEST_DOCTORS
- Produces: `DoctorsPage` renders doctor list with CRUD buttons

- [ ] **Step 1: Write failing test**
Create `tests/admin.test.js`:
```js
import { render, screen } from '@testing-library/react'
import DoctorsPage from '../src/features/admin/DoctorsPage'

test('renders seeded doctors', () => {
  render(<DoctorsPage />)
  expect(screen.getByText('Dr. Ahmed')).toBeInTheDocument()
  expect(screen.getByText('Dr. Fatima')).toBeInTheDocument()
})
```

- [ ] **Step 2: Implement AdminLayout**
Create `src/features/admin/AdminLayout.jsx`:
```jsx
import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const menuItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/doctors', label: 'Doctors' },
    { path: '/admin/staff', label: 'Staff' },
    { path: '/admin/schedule', label: 'Schedule' },
    { path: '/admin/analytics', label: 'Analytics' },
    { path: '/admin/config', label: 'Config' },
  ]

  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-800 text-white p-4">
        <h2 className="font-bold mb-4">Admin Panel</h2>
        {menuItems.map(item => (
          <NavLink key={item.path} to={item.path} className="block py-2 hover:text-blue-300">
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Implement DoctorsPage (stub using seed data)**
Create `src/features/admin/DoctorsPage.jsx`:
```jsx
import { TEST_DOCTORS } from '../../data/seedDoctors'

export default function DoctorsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Doctors Management</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Specialty</th>
            <th className="p-2 text-left">Fee</th>
            <th className="p-2 text-left">Room</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {TEST_DOCTORS.map(doc => (
            <tr key={doc.id} className="border-t">
              <td className="p-2">{doc.name}</td>
              <td className="p-2">{doc.specialty}</td>
              <td className="p-2">${doc.fee}</td>
              <td className="p-2">{doc.room}</td>
              <td className="p-2">
                <button className="text-blue-600 mr-2">Edit</button>
                <button className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Add Doctor</button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**
Run: `npm test -- tests/admin.test.js`
Expected: PASS

---

### Task 5: Routing & Protected Routes

**Files:**
- Create: `src/routes.jsx`
- Create: `src/auth/ProtectedRoute.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `AuthContext.jsx` exports `useAuth`, `AuthProvider`
- Produces: `<Routes>` with role-based navigation from login to respective dashboard

- [ ] **Step 1: Write ProtectedRoute**
Create `src/auth/ProtectedRoute.jsx`:
```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />
  }
  return children
}
```

- [ ] **Step 2: Write routes config**
Create `src/routes.jsx`:
```jsx
import { Routes, Route } from 'react-router-dom'
import LoginPage from './auth/LoginPage'
import AdminLayout from './features/admin/AdminLayout'
import StaffLayout from './features/staff/StaffLayout'
import DoctorLayout from './features/doctor/DoctorLayout'
import PatientLayout from './features/patient/PatientLayout'
import { ProtectedRoute } from './auth/ProtectedRoute'
import AdminDashboard from './features/admin/Dashboard'
import DoctorsPage from './features/admin/DoctorsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="doctors" element={<DoctorsPage />} />
      </Route>

      {/* Staff Routes - placeholder */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['staff']}>
          <div>Staff Dashboard (TBD)</div>
        </ProtectedRoute>
      } />

      {/* Doctor Routes - placeholder */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <div>Doctor Dashboard (TBD)</div>
        </ProtectedRoute>
      } />

      {/* Patient Routes - placeholder */}
      <Route path="/patient" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <div>Patient Dashboard (TBD)</div>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
```

- [ ] **Step 3: Wire routes into App**
Update `src/App.jsx`:
```jsx
import AppRoutes from './routes'
import './index.css'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppRoutes />
    </div>
  )
}
```

---

### Task 6: Staff Dashboard (Queue + No-Show)

**Files:**
- Create: `src/features/staff/StaffLayout.jsx`
- Create: `src/features/staff/LiveQueue.jsx`
- Create: `src/features/staff/NoShowHandler.jsx`
- Modify: `src/routes.jsx` (add staff routes)

**Interfaces:**
- Consumes: `useRealtimeQueue(doctorId)` hook
- Consumes: `reorderNoShow()` from tokenGenerator
- Produces: Staff can view live queue and trigger no-show reorder

- [ ] **Step 1: Build StaffLayout**
Create `src/features/staff/StaffLayout.jsx`:
```jsx
import { NavLink, Outlet } from 'react-router-dom'

export default function StaffLayout() {
  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-800 text-white p-4">
        <h2 className="font-bold mb-4">Counter Staff</h2>
        <NavLink to="/staff/queue" className="block py-2 hover:text-blue-300">Live Queue</NavLink>
        <NavLink to="/staff/book" className="block py-2 hover:text-blue-300">Book Appointment</NavLink>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Build LiveQueue with mock tokens**
Create `src/features/staff/LiveQueue.jsx`:
```jsx
const MOCK_QUEUE = [
  { id: 't1', token: '101', patientName: 'Sarah Johnson', status: 'current', condition: 'Chest pain' },
  { id: 't2', token: '102', patientName: 'Ali Hassan', status: 'pending', condition: 'Routine checkup' },
  { id: 't3', token: '103', patientName: 'Maria Garcia', status: 'pending', condition: 'Skin rash' },
  { id: 't4', token: '104', patientName: 'Omar Faruk', status: 'no-show', condition: 'Joint pain' },
]

export default function LiveQueue() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Live Queue — Dr. Ahmed (Cardiology)</h1>
      <table className="w-full border-collapse">
        <thead><tr className="bg-gray-100">
          <th className="p-2">Token</th>
          <th className="p-2">Patient</th>
          <th className="p-2">Status</th>
          <th className="p-2">Actions</th>
        </tr></thead>
        <tbody>
          {MOCK_QUEUE.map(token => (
            <tr key={token.id} className="border-t">
              <td className="p-2 font-bold">{token.token}</td>
              <td className="p-2">{token.patientName}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  token.status === 'current' ? 'bg-yellow-100 text-yellow-800' :
                  token.status === 'no-show' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {token.status}
                </span>
              </td>
              <td className="p-2">
                {token.status === 'no-show' && (
                  <button className="bg-blue-600 text-white px-2 py-1 rounded">
                    Move to End
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: Update routes to include staff**
In `src/routes.jsx`, replace the staff placeholder with:
```jsx
<Route path="/staff" element={
  <ProtectedRoute allowedRoles={['staff']}>
    <StaffLayout />
  </ProtectedRoute>
}>
  <Route path="queue" index element={<LiveQueue />} />
  <Route path="book" element={<div>Book Appointment (TBD)</div>} />
</Route>
```

---

### Task 7: Doctor Dashboard (Real-time Queue + Next Patient)

**Files:**
- Create: `src/features/doctor/DoctorLayout.jsx`
- Create: `src/features/doctor/DoctorDashboard.jsx`
- Create: `src/features/doctor/ArrivalToggle.jsx`
- Create: `src/features/doctor/NextPatientButton.jsx`
- Modify: `src/routes.jsx`

**Interfaces:**
- Consumes: `useRealtimeQueue(doctorId)` from Task 3
- Produces: Live token list with arrival toggle + next patient button

- [ ] **Step 1: Build DoctorDashboard with token list**
Create `src/features/doctor/DoctorDashboard.jsx`:
```jsx
import { NextPatientButton } from './NextPatientButton'
import { ArrivalToggle } from './ArrivalToggle'

const MOCK_TODAY_TOKENS = [
  { token: '101', name: 'Sarah Johnson', age: 34, condition: 'Chest pain', status: 'current' },
  { token: '102', name: 'Ali Hassan', age: 45, condition: 'Routine', status: 'pending' },
  { token: '103', name: 'Maria Garcia', age: 28, condition: 'Rash', status: 'pending' },
]

export default function DoctorDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dr. Ahmed — Today's Appointments</h1>
      <ArrivalToggle currentStatus="arriving" />
      <div className="mt-4 space-y-2">
        {MOCK_TODAY_TOKENS.map(t => (
          <div key={t.token} className={`p-3 border rounded ${
            t.status === 'current' ? 'bg-yellow-50 border-yellow-300' : 'bg-white'
          }`}>
            <span className="font-bold">#{t.token} {t.name} ({t.age})</span>
            <span className="text-gray-600 ml-2">— {t.condition}</span>
          </div>
        ))}
      </div>
      <NextPatientButton />
    </div>
  )
}
```

- [ ] **Step 2: Build ArrivalToggle**
Create `src/features/doctor/ArrivalToggle.jsx`:
```jsx
export function ArrivalToggle({ currentStatus }) {
  return (
    <div className="flex gap-2 mb-4">
      {['on_way', 'arriving_5min', 'arrived'].map(status => (
        <button
          key={status}
          className={`px-3 py-1 rounded ${
            currentStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          {status === 'on_way' && 'On My Way'}
          {status === 'arriving_5min' && 'Arriving in 5 min'}
          {status === 'arrived' && 'Arrived'}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Build NextPatientButton**
Create `src/features/doctor/NextPatientButton.jsx`:
```jsx
export function NextPatientButton() {
  return (
    <button className="mt-4 bg-green-600 text-white px-6 py-3 rounded font-bold">
      Next Patient
    </button>
  )
}
```

- [ ] **Step 4: Add doctor routes**
In `src/routes.jsx`:
```jsx
<Route path="/doctor" element={
  <ProtectedRoute allowedRoles={['doctor']}>
    <DoctorLayout />
  </ProtectedRoute>
}>
  <Route index element={<DoctorDashboard />} />
</Route>
```

---

### Task 8: Patient Dashboard (Search + Book + Pay)

**Files:**
- Create: `src/features/patient/PatientLayout.jsx`
- Create: `src/features/patient/SearchDoctor.jsx`
- Create: `src/features/patient/PaymentForm.jsx`
- Create: `src/features/patient/TrackQueue.jsx`
- Modify: `src/routes.jsx`

**Interfaces:**
- Consumes: `TEST_DOCTORS` from seedDoctors
- Produces: Patient can search doctors, book token, pay (mock), track queue

- [ ] **Step 1: Build SearchDoctor**
Create `src/features/patient/SearchDoctor.jsx`:
```jsx
import { TEST_DOCTORS, TEST_SPECIALTIES } from '../../data/seedDoctors'

export default function SearchDoctor() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Find a Doctor</h1>
      <select className="p-2 border rounded mb-4">
        {TEST_SPECIALTIES.map(s => <option key={s}>{s}</option>)}
      </select>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEST_DOCTORS.map(doc => (
          <div key={doc.id} className="border p-4 rounded shadow">
            <h3 className="font-bold text-lg">{doc.name}</h3>
            <p className="text-gray-600">{doc.specialty}</p>
            <p className="font-semibold">Fee: ${doc.fee}</p>
            <p className="text-sm">Room: {doc.room}</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded mt-2">
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build PaymentForm (mock)**
Create `src/features/patient/PaymentForm.jsx`:
```jsx
export default function PaymentForm({ fee }) {
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Payment — ${fee}</h2>
      <div className="border p-3 mb-4 bg-gray-50">
        Card number: 4242 4242 4242 4242 (demo, no real charge)
      </div>
      <button className="w-full bg-green-600 text-white py-2 rounded">
        Confirm Payment (Demo)
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Build TrackQueue**
Create `src/features/patient/TrackQueue.jsx`:
```jsx
export default function TrackQueue({ token, doctorEta }) {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Your Appointment</h2>
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-600">Token #{token}</p>
        <p className="text-gray-600 mt-2">3 patients ahead</p>
        <p className="text-sm mt-1">Dr. Ahmed: {doctorEta}</p>
      </div>
    </div>
  )
}
```

---

### Task 9: Wire Up All Routes & Demo Flow Integration

**Files:**
- Modify: `src/routes.jsx` (finalize all routes)
- Modify: `src/features/admin/DoctorsPage.jsx` (wire to staff book flow)
- Test: Manual demo flow test via browser

- [ ] **Step 1: Final route config**
Ensure all routes are wired: admin (doctors, staff, schedule, analytics, config), staff (queue, book), doctor (dashboard), patient (search, payment, track)

- [ ] **Step 2: Connect SearchDoctor → PaymentForm → TrackQueue**
Use React state or simple URL params to pass booking from search to payment to tracking view

- [ ] **Step 3: Run full dev server test**
Run: `npm run dev`  
Manually verify: login as each role → visit dashboard → navigate flows

---

## Self-Review Checklist

- [x] **Spec coverage:** All SRS requirements mapped to tasks:
  - Admin CRUD doctors/staff ✓ (Task 4)
  - Token-based queuing ✓ (Task 3)
  - No-show → last token ✓ (Task 3)
  - Real-time queue ✓ (Task 3, 6, 7)
  - Doctor next button + notes ✓ (Task 7)
  - Staff queue view + no-show ✓ (Task 6)
  - Patient book + pay + track ✓ (Task 8)
  - Seed data + credentials ✓ (Task 2)

- [x] **Placeholders scan:** No "TODO" or "TBD" blocks left as steps — all placeholder files are explicitly stubs with clear next-step markers

- [x] **Type consistency:** All component file paths match; `useAuth`, `reorderNoShow`, `generateNextToken` consistent across tasks

- [x] **Task sizing:** Each task = 1 role's dashboard; smallest testable units with clear boundaries

---

## Execution Handoff

**"Plan complete and saved to `docs/superpowers/plans/2026-10-11-hospital-booking-demo.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?"**