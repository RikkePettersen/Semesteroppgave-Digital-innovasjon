import {
  collection, doc, addDoc, getDocs, onSnapshot,
  orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'

const demoGroupsKey = (uid) => `vennly_groups_${uid}`
const demoMsgsKey   = (gid) => `vennly_grp_msgs_${gid}`

export async function createGroupChat(uid, name, members) {
  // members: [{ id, name, photo }]
  if (!isFirebaseConfigured) {
    const groups = JSON.parse(localStorage.getItem(demoGroupsKey(uid)) || '[]')
    const group = {
      id: 'g-' + Date.now(),
      name,
      createdBy: uid,
      members: members.map(m => m.id),
      memberProfiles: Object.fromEntries(members.map(m => [m.id, { name: m.name, photo: m.photo }])),
      createdAt: new Date().toISOString(),
    }
    groups.unshift(group)
    localStorage.setItem(demoGroupsKey(uid), JSON.stringify(groups))
    return group
  }
  const ref = await addDoc(collection(db, 'groupChats'), {
    name,
    createdBy: uid,
    members: members.map(m => m.id),
    memberProfiles: Object.fromEntries(members.map(m => [m.id, { name: m.name, photo: m.photo }])),
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
  })
  return { id: ref.id, name, members: members.map(m => m.id), memberProfiles: Object.fromEntries(members.map(m => [m.id, { name: m.name, photo: m.photo }])) }
}

export async function getGroupChats(uid) {
  if (!isFirebaseConfigured) {
    return JSON.parse(localStorage.getItem(demoGroupsKey(uid)) || '[]')
  }
  const snap = await getDocs(collection(db, 'groupChats'))
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(g => Array.isArray(g.members) && g.members.includes(uid))
}

export function listenGroupMessages(groupId, callback) {
  if (!isFirebaseConfigured) {
    callback(JSON.parse(localStorage.getItem(demoMsgsKey(groupId)) || '[]'))
    return () => {}
  }
  const q = query(
    collection(db, 'groupChats', groupId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function sendGroupMessage(groupId, text, uid, senderName, senderPhoto) {
  if (!isFirebaseConfigured) {
    const msgs = JSON.parse(localStorage.getItem(demoMsgsKey(groupId)) || '[]')
    const msg = { id: Date.now().toString(), text, from: uid, fromName: senderName, fromPhoto: senderPhoto, createdAt: new Date().toISOString() }
    msgs.push(msg)
    localStorage.setItem(demoMsgsKey(groupId), JSON.stringify(msgs))
    return
  }
  await addDoc(collection(db, 'groupChats', groupId, 'messages'), {
    text, from: uid, fromName: senderName, fromPhoto: senderPhoto,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'groupChats', groupId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  })
}
