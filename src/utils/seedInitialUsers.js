import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

// Seed initial users for the demo (run once after setup)
export const seedInitialUsers = async () => {
  const users = [
    { email: 'admin@hospital.com', password: 'admin123', role: 'admin' },
    { email: 'staff@hospital.com', password: 'staff123', role: 'staff' },
    { email: 'doctor@hospital.com', password: 'doctor123', role: 'doctor' },
    { email: 'patient@hospital.com', password: 'patient123', role: 'patient' },
  ]

  const results = []
  for (const u of users) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.password)
      results.push({ ...u, uid: cred.user.uid, created: true })
    } catch (err) {
      // User already exists
      results.push({ ...u, error: err.message })
    }
  }
  return results
}
