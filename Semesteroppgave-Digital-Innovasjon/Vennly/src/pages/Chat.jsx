import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, MessageCircle, Send } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getMatches } from '../lib/matches'
import { listenMessages, saveMessage } from '../lib/messages'

export default function Chat() {
  const { matchId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [match, setMatch]     = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user || !matchId) { setLoading(false); return }
    getMatches(user.uid).then(list => {
      const m = list.find(x => x.id === matchId)
      setMatch(m || null)
      setLoading(false)
    })
  }, [user, matchId])

  useEffect(() => {
    if (!user || !matchId) return
    const unsub = listenMessages(user.uid, matchId, setMessages)
    return unsub
  }, [user, matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !match) return
    const t = text.trim()
    setText('')
    await saveMessage(user.uid, matchId, t, user.uid)
  }

  if (!matchId) {
    return (
      <Layout title="Meldinger">
        <div className="empty" style={{ marginTop: 40 }}>
          <MessageCircle size={42} style={{ marginBottom: 12, opacity: 0.35 }} />
          <h3>Ingen samtale valgt</h3>
          <p style={{ marginTop: 8 }}>Gå til Venner og trykk på meldingsikonet.</p>
          <button className="btn" style={{ marginTop: 20, maxWidth: 240 }}
            onClick={() => navigate('/matches')}>Til venner</button>
        </div>
      </Layout>
    )
  }

  if (loading) return <Layout title="Meldinger"><p className="hint" style={{ padding: 20 }}>Laster …</p></Layout>
  if (!match)  return <Layout title="Meldinger"><p className="hint" style={{ padding: 20 }}>Fant ikke samtalen.</p></Layout>

  return (
    <div className="phone">
      <BottomNav />
      <div className="chat-layout">
        <header className="chat-header">
          <button className="chat-back" onClick={() => navigate('/meldinger')}>
            <ChevronLeft size={22} />
          </button>
          <img src={match.photo} alt={match.name} className="chat-avatar" />
          <div className="chat-header-info">
            <strong>{match.name}</strong>
            <span>{match.city}</span>
          </div>
        </header>

        <div className="chat-messages">
          {messages.length === 0 && (
            <p className="chat-empty">Si hei til {match.name}! 👋</p>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`bubble ${msg.from === user.uid ? 'mine' : 'theirs'}`}>
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Melding til ${match.name} …`}
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
