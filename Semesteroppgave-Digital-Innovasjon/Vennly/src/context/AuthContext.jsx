import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'
import { isStudentEmail } from '../data/options'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Hvis Firebase ikke er satt opp ennå, faller vi tilbake til en "demo-modus"
// som lagrer i nettleseren (localStorage) slik at appen fortsatt kan testes.
const DEMO_KEY = 'vennly_demo_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)        // Firebase auth-bruker (eller demo)
  const [profile, setProfile] = useState(null)  // Profildata fra Firestore
  const [loading, setLoading] = useState(true)

  // ---- Lytt på innloggingsstatus -----------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured) {
      const saved = localStorage.getItem(DEMO_KEY)
      if (saved) {
        const p = JSON.parse(saved)
        setUser({ uid: p.uid, email: p.email })
        setProfile(p)
      }
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      if (fbUser) {
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid))
          setProfile(snap.exists() ? snap.data() : null)
        } catch {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // ---- Registrering --------------------------------------------------------
  async function register(email, password, profileData) {
    const verified = isStudentEmail(email)

    if (!isFirebaseConfigured) {
      const demo = {
        uid: 'demo-' + Date.now(),
        email,
        verifiedStudent: verified,
        plus: false,
        createdAt: new Date().toISOString(),
        ...profileData,
      }
      localStorage.setItem(DEMO_KEY, JSON.stringify(demo))
      setUser({ uid: demo.uid, email })
      setProfile(demo)
      return demo
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await sendEmailVerification(cred.user)
    const newProfile = {
      uid: cred.user.uid,
      email,
      verifiedStudent: verified,
      plus: false,
      createdAt: new Date().toISOString(),
      ...profileData,
    }
    await setDoc(doc(db, 'users', cred.user.uid), newProfile)
    setProfile(newProfile)
    return newProfile
  }

  // ---- Innlogging ----------------------------------------------------------
  async function login(email, password) {
    if (!isFirebaseConfigured) {
      const saved = localStorage.getItem(DEMO_KEY)
      if (saved) {
        const p = JSON.parse(saved)
        setUser({ uid: p.uid, email: p.email })
        setProfile(p)
        return
      }
      throw new Error('Ingen demo-bruker funnet. Registrer deg først.')
    }
    await signInWithEmailAndPassword(auth, email, password)
  }

  // ---- Utlogging -----------------------------------------------------------
  async function logout() {
    if (!isFirebaseConfigured) {
      setUser(null)
      setProfile(null)
      return
    }
    await signOut(auth)
  }

  // ---- Oppdater profil -----------------------------------------------------
  async function saveProfile(updates) {
    const merged = { ...profile, ...updates }
    setProfile(merged)

    if (!isFirebaseConfigured) {
      try {
        localStorage.setItem(DEMO_KEY, JSON.stringify(merged))
      } catch {
        const { photos: _p, photo: _ph, ...rest } = merged
        localStorage.setItem(DEMO_KEY, JSON.stringify(rest))
      }
      return
    }

    // Bilder er nå Firebase Storage-URL-er (korte strenger) – trygt å lagre i Firestore
    try {
      await updateDoc(doc(db, 'users', user.uid), updates)
    } catch {
      await setDoc(doc(db, 'users', user.uid), merged)
    }
  }

  async function resendVerificationEmail() {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser)
  }

  async function resetPassword(email) {
    if (!isFirebaseConfigured) throw new Error('Ikke tilgjengelig i demo-modus.')
    await sendPasswordResetEmail(auth, email)
  }

  const value = {
    user, profile, loading,
    register, login, logout, saveProfile,
    resendVerificationEmail, resetPassword,
    isFirebaseConfigured,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}