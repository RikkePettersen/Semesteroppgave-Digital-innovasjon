import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Send, Users } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { getGroupChats, listenGroupMessages, sendGroupMessage } from '../lib/groupChats'

export default function GroupChat() {
  const { groupId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [group,    setGroup]    = useState(null)
  const [messages, setMessages] = useState([])
  const [text,     setText]     = useState('')
  const [loading,  setLoading]  = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user || !groupId) return
    getGroupChats(user.uid).then(groups => {
      const g = groups.find(x => x.id === groupId)
      setGroup(g || null)
      setLoading(false)
    })
  }, [user, groupId])

  useEffect(() => {
    if (!groupId) return
    const unsub = listenGroupMessages(groupId, setMessages)
    return unsub
  }, [groupId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !group) return
    const t = text.trim()
    setText('')
    await sendGroupMessage(groupId, t, user.uid, profile?.name || 'Deg', profile?.photo || '')
  }

  if (loading) return (
    <div className="phone">
      <BottomNav />
      <div className="chat-layout"><p className="hint" style={{ padding: 20 }}>Laster …</p></div>
    </div>
  )

  if (!group) return (
    <div className="phone">
      <BottomNav />
      <div className="chat-layout"><p className="hint" style={{ padding: 20 }}>Fant ikke gruppen.</p></div>
    </div>
  )

  const memberProfiles = group.memberProfiles || {}
  const memberPhotos = Object.values(memberProfiles).slice(0, 3)

  return (
    <div className="phone">
      <BottomNav />
      <div className="chat-layout">
        <header className="chat-header">
          <button className="chat-back" onClick={() => navigate('/meldinger')}>
            <ChevronLeft size={22} />
          </button>
          <div className="group-avatar-stack">
            {memberPhotos.map((m, i) => (
              <img key={i} src={m.photo} alt={m.name} className="group-avatar-img" style={{ zIndex: memberPhotos.length - i }} />
            ))}
            {Object.keys(memberProfiles).length === 0 && <Users size={22} />}
          </div>
          <div className="chat-header-info">
            <strong>{group.name}</strong>
            <span>{Object.keys(memberProfiles).length} deltakere</span>
          </div>
        </header>

        <div className="chat-messages">
          {messages.length === 0 && (
            <p className="chat-empty">Ingen meldinger ennå. Si hei! 👋</p>
          )}
          {messages.map(msg => {
            const isMe = msg.from === user.uid
            return (
              <div key={msg.id} className={`bubble ${isMe ? 'mine' : 'theirs'}`}>
                {!isMe && (
                  <div className="bubble-sender">
                    {msg.fromPhoto && <img src={msg.fromPhoto} alt={msg.fromName} className="bubble-avatar" />}
                    <span className="bubble-name">{msg.fromName}</span>
                  </div>
                )}
                {msg.text}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Skriv en melding …"
            autoComplete="off"
          />
          <button type="submit" className="chat-send" disabled={!text.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
