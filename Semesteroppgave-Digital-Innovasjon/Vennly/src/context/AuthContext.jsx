import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
          const base = snap.exists() ? snap.data() : null
          // Bilder lagres kun lokalt (for store for Firestore) – merge inn
          const cached = JSON.parse(localStorage.getItem(`vennly_photos_${fbUser.uid}`) || 'null')
          setProfile(base ? { ...base, ...(cached || {}) } : cached)
        } catch {
          const cached = JSON.parse(localStorage.getItem(`vennly_photos_${fbUser.uid}`) || 'null')
          setProfile(cached)
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
      const { photos: _p, photo: _ph, ...demoWithoutPhotos } = merged
      try {
        localStorage.setItem(DEMO_KEY, JSON.stringify(merged))
      } catch {
        // Bilder overstiger trolig localStorage-kvoten – lagre uten bilder
        localStorage.setItem(DEMO_KEY, JSON.stringify(demoWithoutPhotos))
      }
      return
    }

    // Bilder er base64-blobs – for store for Firestore (1 MB-grense).
    // Lagre dem kun lokalt; send bare tekstfelt til databasen.
    const { photos, photo, ...firestoreFields } = updates
    if (photos !== undefined || photo !== undefined) {
      const cachedPhotos = { photos: merged.photos, photo: merged.photo }
      try {
        localStorage.setItem(`vennly_photos_${user.uid}`, JSON.stringify(cachedPhotos))
      } catch {
        throw new Error('Bildene er for store for lokal lagring. Prøv færre eller mindre bilder.')
      }
    }

    if (Object.keys(firestoreFields).length > 0) {
      const { photos: _p, photo: _ph, ...mergedForFirestore } = merged
      try {
        await updateDoc(doc(db, 'users', user.uid), firestoreFields)
      } catch {
        await setDoc(doc(db, 'users', user.uid), mergedForFirestore)
      }
    }
  }

  const value = {
    user, profile, loading,
    register, login, logout, saveProfile,
    isFirebaseConfigured,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}