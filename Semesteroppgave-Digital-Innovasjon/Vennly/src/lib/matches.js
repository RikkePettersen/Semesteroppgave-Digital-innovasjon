// Liten hjelper for å lagre/hente matcher. Bruker Firestore når den er
// konfigurert, ellers localStorage (demo-modus).
import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'

const key = (uid) => `vennly_matches_${uid}`

export async function getMatches(uid) {
  if (!isFirebaseConfigured) {
    return JSON.parse(localStorage.getItem(key(uid)) || '[]')
  }
  const snap = await getDocs(collection(db, 'users', uid, 'matches'))
  return snap.docs.map((d) => d.data())
}

export async function addMatch(uid, profile) {
  const match = { ...profile, matchedAt: new Date().toISOString() }
  if (!isFirebaseConfigured) {
    const list = JSON.parse(localStorage.getItem(key(uid)) || '[]')
    if (!list.find((m) => m.id === profile.id)) {
      list.unshift(match)
      localStorage.setItem(key(uid), JSON.stringify(list))
    }
    return
  }
  await setDoc(doc(db, 'users', uid, 'matches', profile.id), match)
}