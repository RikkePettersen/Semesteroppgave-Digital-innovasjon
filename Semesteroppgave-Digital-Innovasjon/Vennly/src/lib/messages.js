const key = (uid, matchId) => `vennly_msgs_${uid}_${matchId}`

export function getMessages(uid, matchId) {
  return JSON.parse(localStorage.getItem(key(uid, matchId)) || '[]')
}

export function saveMessage(uid, matchId, text, fromId) {
  const msgs = getMessages(uid, matchId)
  const msg = {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    text,
    from: fromId,
    at: new Date().toISOString(),
  }
  msgs.push(msg)
  localStorage.setItem(key(uid, matchId), JSON.stringify(msgs))
  return msg
}
