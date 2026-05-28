import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Users } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getMatches } from '../lib/matches'
import { getMessages } from '../lib/messages'
import { getGroupChats } from '../lib/groupChats'

export default function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState(null)

  useEffect(() => {
    if (!user) return
    Promise.all([getMatches(user.uid), getGroupChats(user.uid)]).then(([matches, groups]) => {
      const matchConvos = matches.map(m => {
        const msgs = getMessages(user.uid, m.id)
        const last = msgs[msgs.length - 1]
        return {
          type: 'match',
          id: m.id,
          name: m.name,
          photo: m.photo,
          lastText: last?.text || null,
          lastAt: last?.at || null,
        }
      })

      const groupConvos = groups.map(g => ({
        type: 'group',
        id: g.id,
        name: g.name,
        memberProfiles: g.memberProfiles || {},
        lastText: g.lastMessage || null,
        lastAt: g.lastMessageAt || null,
      }))

      const all = [...groupConvos, ...matchConvos].sort((a, b) => {
        if (!a.lastAt && !b.lastAt) return 0
        if (!a.lastAt) return 1
        if (!b.lastAt) return -1
        return b.lastAt > a.lastAt ? 1 : -1
      })

      setConversations(all)
    })
  }, [user])

  function openChat(item) {
    if (item.type === 'group') navigate(`/chat/gruppe/${item.id}`)
    else navigate(`/chat/${item.id}`)
  }

  return (
    <Layout title="Meldinger">
      <h1 className="screen-title">Meldinger</h1>

      {conversations === null && <p className="hint" style={{ marginTop: 16 }}>Laster …</p>}

      {conversations !== null && conversations.length === 0 && (
        <div className="empty" style={{ marginTop: 40 }}>
          <MessageCircle size={42} style={{ marginBottom: 12, opacity: 0.35 }} />
          <h3>Ingen samtaler ennå</h3>
          <p style={{ marginTop: 8 }}>Gå til Venner og trykk på meldingsikonet for å starte en samtale.</p>
          <button className="btn" style={{ marginTop: 20, maxWidth: 240 }}
            onClick={() => navigate('/matches')}>Til venner</button>
        </div>
      )}

      {conversations && conversations.length > 0 && (
        <div className="friend-list" style={{ marginTop: 8 }}>
          {conversations.map(item => (
            <div
              key={item.id}
              className="friend-card"
              style={{ cursor: 'pointer' }}
              onClick={() => openChat(item)}
            >
              {item.type === 'group' ? (
                <div className="group-avatar-stack small">
                  {Object.values(item.memberProfiles).slice(0, 3).map((m, i, arr) => (
                    <img key={i} src={m.photo} alt={m.name} className="group-avatar-img" style={{ zIndex: arr.length - i }} />
                  ))}
                  {Object.keys(item.memberProfiles).length === 0 && (
                    <div className="friend-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="friend-photo" style={{ backgroundImage: `url(${item.photo})` }} />
              )}

              <div className="friend-info">
                <strong>{item.name}</strong>
                {item.lastText ? (
                  <div className="hint" style={{ marginTop: 3, fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                    {item.lastText}
                  </div>
                ) : (
                  <div className="hint" style={{ marginTop: 3, fontSize: '0.78rem' }}>
                    {item.type === 'group' ? 'Gruppesamtale' : 'Si hei!'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
