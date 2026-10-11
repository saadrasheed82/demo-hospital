import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase as getRealtimeDb } from 'firebase/database'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

// Only initialize if a real API key is present
let app = null
let auth = null
let db = null
let realtimeDb = null

if (apiKey && apiKey !== 'demo-key' && apiKey.length > 10) {
  const firebaseConfig = {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  }

  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    realtimeDb = getRealtimeDb(app)
  } catch (err) {
    console.warn('Firebase init failed (demo mode):', err.message)
  }
}

export { auth, db, realtimeDb }
export const isFirebaseActive = !!app
