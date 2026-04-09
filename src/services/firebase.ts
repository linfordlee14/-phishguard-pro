import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingFirebaseKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

let firebaseInitializationError: string | null = missingFirebaseKeys.length > 0
  ? `Missing Firebase configuration: ${missingFirebaseKeys.join(', ')}`
  : null

let authInstance: Auth | null = null
let dbInstance: Firestore | null = null

if (!firebaseInitializationError) {
  try {
    const app = initializeApp(firebaseConfig)
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
  } catch {
    firebaseInitializationError = 'Firebase client configuration is invalid. Please verify the VITE_FIREBASE_* environment values.'
  }
}

export { firebaseInitializationError }
export const isFirebaseReady = Boolean(authInstance && dbInstance)
export const authClient = authInstance
export const dbClient = dbInstance
export const auth = authInstance as Auth
export const db = dbInstance as Firestore