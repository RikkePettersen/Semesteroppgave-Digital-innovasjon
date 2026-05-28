import {
  collection, addDoc, getDocs, doc, setDoc,
  onSnapshot, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'

const convId = (a, b) => [a, b].sort().join('_')
const localKey = (uid, matchId) => `vennly_msgs_${uid}_${matchId}`

export function getMessages(uid, matchId) {
  return JSON.parse(localStorage.getItem(localKey(uid, matchId)) || '[]')
}

// Returns list of { matchId, lastMessage, lastAt } for conversations with messages
export async function getActiveConversations(uid) {
  if (!isFirebaseConfigured) {
    // Scan localStorage for any conversation keys belonging to this user
    const prefix = `vennly_msgs_${uid}_`
    return Object.keys(localStorage)
      .filter(k => k.startsWith(prefix))
      .map(k => {
        const msgs = JSON.parse(localStorage.getItem(k) || '[]')
        if (msgs.length === 0) return null
        const last = msgs[msgs.length - 1]
        return { matchId: k.slice(prefix.length), lastMessage: last.text, lastAt: last.at }
      })
      .filter(Boolean)
  }
  const snap = await getDocs(collection(db, 'users', uid, 'conversations'))
  return snap.docs.map(d => ({ matchId: d.id, ...d.data() }))
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
  // Track conversation for both participants so inbox can filter
  const now = serverTimestamp()
  await setDoc(doc(db, 'users', uid, 'conversations', matchId), { lastMessage: text, lastAt: now })
  await setDoc(doc(db, 'users', matchId, 'conversations', uid), { lastMessage: text, lastAt: now })
}
