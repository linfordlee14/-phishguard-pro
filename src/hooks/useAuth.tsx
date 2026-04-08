import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import { seedInitialData } from '@/services/seedData'

interface AuthState {
  user: User | null
  orgId: string | null
  orgName: string | null
  loading: boolean
}

type AuthAction =
  | { type: 'SET_USER'; user: User | null; orgId: string | null; orgName: string | null }
  | { type: 'SET_LOADING'; loading: boolean }

const initialState: AuthState = { user: null, orgId: null, orgName: null, loading: true }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { user: action.user, orgId: action.orgId, orgName: action.orgName, loading: false }
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
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const orgSnap = await getDoc(doc(db, 'organizations', user.uid))
        const orgData = orgSnap.data()
        dispatch({
          type: 'SET_USER',
          user,
          orgId: orgSnap.exists() ? orgSnap.id : null,
          orgName: orgData?.name ?? null,
        })
      } else {
        dispatch({ type: 'SET_USER', user: null, orgId: null, orgName: null })
      }
    })
    return unsub
  }, [])

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', loading: true })
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string, companyName: string, _fullName: string) => {
    dispatch({ type: 'SET_LOADING', loading: true })
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const orgRef = doc(db, 'organizations', cred.user.uid)
    await setDoc(orgRef, {
      id: cred.user.uid,
      name: companyName,
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
