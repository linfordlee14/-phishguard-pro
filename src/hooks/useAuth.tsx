import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db, firebaseInitializationError, isFirebaseReady } from '@/services/firebase'
import { seedInitialData } from '@/services/seedData'

interface AuthState {
  user: User | null
  orgId: string | null
  orgName: string | null
  onboardingCompleted: boolean
  loading: boolean
}

type AuthAction =
  | { type: 'SET_USER'; user: User | null; orgId: string | null; orgName: string | null; onboardingCompleted: boolean }
  | { type: 'SET_LOADING'; loading: boolean }

const initialState: AuthState = { user: null, orgId: null, orgName: null, onboardingCompleted: false, loading: true }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        user: action.user,
        orgId: action.orgId,
        orgName: action.orgName,
        onboardingCompleted: action.onboardingCompleted,
        loading: false,
      }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
  }
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, companyName: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    if (!isFirebaseReady) {
      dispatch({ type: 'SET_USER', user: null, orgId: null, orgName: null, onboardingCompleted: false })
      return
    }

    const firebaseAuth = auth
    const firestore = db
    let unsubscribeOrganization: (() => void) | undefined

    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      if (unsubscribeOrganization) {
        unsubscribeOrganization()
        unsubscribeOrganization = undefined
      }

      if (user) {
        const organizationRef = doc(firestore, 'organizations', user.uid)
        unsubscribeOrganization = onSnapshot(organizationRef, (organizationSnapshot) => {
          const orgData = organizationSnapshot.data()
          dispatch({
            type: 'SET_USER',
            user,
            orgId: user.uid,
            orgName: orgData?.name ?? null,
            onboardingCompleted: orgData?.onboardingCompleted === true,
          })
        })
      } else {
        dispatch({ type: 'SET_USER', user: null, orgId: null, orgName: null, onboardingCompleted: false })
      }
    })

    return () => {
      unsubscribeOrganization?.()
      unsub()
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (!isFirebaseReady) throw new Error(firebaseInitializationError || 'Firebase authentication is unavailable.')
    const firebaseAuth = auth
    dispatch({ type: 'SET_LOADING', loading: true })
    await signInWithEmailAndPassword(firebaseAuth, email, password)
  }

  const register = async (email: string, password: string, companyName: string, _fullName: string) => {
    if (!isFirebaseReady) throw new Error(firebaseInitializationError || 'Firebase authentication is unavailable.')
    const firebaseAuth = auth
    const firestore = db
    dispatch({ type: 'SET_LOADING', loading: true })
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    const orgRef = doc(firestore, 'organizations', cred.user.uid)
    await setDoc(orgRef, {
      id: cred.user.uid,
      name: companyName,
      onboardingCompleted: false,
      plan: 'pro',
      seats: 25,
      ownerId: cred.user.uid,
      createdAt: Timestamp.now(),
    })
    await seedInitialData(cred.user.uid)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
