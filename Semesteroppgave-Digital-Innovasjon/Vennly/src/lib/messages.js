import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'

// Stable conversation ID regardless of who initiates
const convId = (a, b) => [a, b].sort().join('_')
const localKey = (uid, matchId) => `vennly_msgs_${uid}_${matchId}`

export function getMessages(uid, matchId) {
  return JSON.parse(localStorage.getItem(localKey(uid, matchId)) || '[]')
}

export function listenMessages(uid, matchId, callback) {
  if (!isFirebaseConfigured) {
    callback(getMessages(uid, matchId))
    return () => {}
  }
  const q = query(
    collection(db, 'directMessages', convId(uid, matchId), 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function saveMessage(uid, matchId, text, fromId) {
  if (!isFirebaseConfigured) {
    const msgs = getMessages(uid, matchId)
    const msg = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      text,
      from: fromId,
      at: new Date().toISOString(),
    }
    msgs.push(msg)
    localStorage.setItem(localKey(uid, matchId), JSON.stringify(msgs))
    return
  }
  await addDoc(collection(db, 'directMessages', convId(uid, matchId), 'messages'), {
    text,
    from: fromId,
    createdAt: serverTimestamp(),
  })
}
