import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Users, Plus, X, Check } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getMatches } from '../lib/matches'
import { getActiveConversations } from '../lib/messages'
import { getGroupChats, createGroupChat } from '../lib/groupChats'

export default function Messages() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState(null)
  const [matches,       setMatches]       = useState([])
  const [showModal,     setShowModal]     = useState(false)
  const [groupName,     setGroupName]     = useState('')
  const [selected,      setSelected]      = useState([])
  const [creating,      setCreating]      = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getMatches(user.uid),
      getGroupChats(user.uid),
      getActiveConversations(user.uid),
    ]).then(([matchList, groups, activeConvos]) => {
      setMatches(matchList)

      const activeIds = new Map(activeConvos.map(c => [c.matchId, c]))

      const matchConvos = matchList
        .filter(m => activeIds.has(m.id))
        .map(m => {
          const conv = activeIds.get(m.id)
          return {
            type: 'match',
            id: m.id,
            name: m.name,
            photo: m.photo,
            lastText: conv.lastMessage || null,
            lastAt: conv.lastAt || null,
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

  function toggleSelect(match) {
    setSelected(prev =>
      prev.find(m => m.id === match.id)
        ? prev.filter(m => m.id !== match.id)
        : [...prev, { id: match.id, name: match.name, photo: match.photo }]
    )
  }

  async function handleCreateGroup(e) {
    e.preventDefault()
    if (!groupName.trim() || selected.length < 1) return
    setCreating(true)
    const allMembers = [
      { id: user.uid, name: profile?.name || 'Deg', photo: profile?.photo || '' },
      ...selected,
    ]
    const group = await createGroupChat(user.uid, groupName.trim(), allMembers)
    setShowModal(false)
    setGroupName('')
    setSelected([])
    setCreating(false)
    navigate(`/chat/gruppe/${group.id}`)
  }

  return (
    <Layout title="Meldinger">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className="screen-title" style={{ margin: 0 }}>Meldinger</h1>
        <button
          className="btn"
          style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, width: 'auto' }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={15} /> Ny gruppe
        </button>
      </div>

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

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Ny gruppesamtale</h3>
              <button className="navbtn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="field">
                <label>Gruppenavn</label>
                <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="F.eks. Kollokviegruppe …" required />
              </div>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 8 }}>
                Inviter venner ({selected.length} valgt)
              </label>
              {matches.length === 0 ? (
                <p className="hint">Du har ingen venner å invitere ennå.</p>
              ) : (
                <div className="friend-list" style={{ maxHeight: 240, overflowY: 'auto', gap: 6 }}>
                  {matches.map(m => {
                    const isSelected = !!selected.find(s => s.id === m.id)
                    return (
                      <div key={m.id} className={`friend-card${isSelected ? ' selected-member' : ''}`} onClick={() => toggleSelect(m)} style={{ cursor: 'pointer' }}>
                        <div className="friend-photo" style={{ backgroundImage: `url(${m.photo})` }} />
                        <div className="friend-info">
                          <strong>{m.name}</strong>
                          <div className="hint" style={{ fontSize: '0.78rem' }}>{m.city}</div>
                        </div>
                        {isSelected && <Check size={20} color="var(--like)" />}
                      </div>
                    )
                  })}
                </div>
              )}
              <button className="btn" style={{ marginTop: 16, width: '100%' }} disabled={creating || !groupName.trim() || selected.length < 1}>
                {creating ? 'Oppretter …' : 'Opprett gruppe'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
