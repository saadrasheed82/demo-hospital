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
