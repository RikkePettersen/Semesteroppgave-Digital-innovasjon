import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, MessageCircle, Users, Plus, X, Check } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getMatches } from '../lib/matches'
import { getGroupChats, createGroupChat } from '../lib/groupChats'

export default function Matches() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [list,      setList]      = useState(null)
  const [groups,    setGroups]    = useState([])
  const [showModal, setShowModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selected,  setSelected]  = useState([])
  const [creating,  setCreating]  = useState(false)

  useEffect(() => {
    if (!user) return
    getMatches(user.uid).then(setList)
    getGroupChats(user.uid).then(setGroups)
  }, [user])

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
    setGroups(prev => [group, ...prev])
    setShowModal(false)
    setGroupName('')
    setSelected([])
    setCreating(false)
    navigate(`/chat/gruppe/${group.id}`)
  }

  return (
    <Layout title="Venner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className="screen-title" style={{ margin: 0 }}>Dine venner</h1>
        <button
          className="btn"
          style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={15} /> Ny gruppe
        </button>
      </div>

      {list === null && <p className="hint" style={{ marginTop: 16 }}>Laster …</p>}

      {list && list.length === 0 && groups.length === 0 && (
        <div className="empty">
          <Heart size={42} style={{ marginBottom: 12, opacity: 0.4 }} />
          <h3>Ingen venner ennå</h3>
          <p style={{ marginTop: 8 }}>Begynn å sveipe for å finne studievenner!</p>
          <button className="btn" style={{ marginTop: 20 }} onClick={() => navigate('/swipe')}>
            Til sveiping
          </button>
        </div>
      )}

      {groups.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 16 }}>Gruppesamtaler</div>
          <div className="friend-list">
            {groups.map(g => {
              const photos = Object.values(g.memberProfiles || {}).slice(0, 3)
              return (
                <div key={g.id} className="friend-card" onClick={() => navigate(`/chat/gruppe/${g.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="group-avatar-stack small">
                    {photos.map((m, i) => (
                      <img key={i} src={m.photo} alt={m.name} className="group-avatar-img" style={{ zIndex: photos.length - i }} />
                    ))}
                    {photos.length === 0 && <div className="friend-photo" style={{ background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>}
                  </div>
                  <div className="friend-info">
                    <strong>{g.name}</strong>
                    <div className="hint" style={{ marginTop: 3, fontSize: '0.78rem' }}>
                      {Object.keys(g.memberProfiles || {}).length} deltakere
                    </div>
                  </div>
                  <button className="msg-icon-btn" aria-label="Åpne gruppe"><MessageCircle size={22} /></button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {list && list.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: 16 }}>Venner</div>
          <div className="friend-list">
            {list.map((m) => (
              <div key={m.id} className="friend-card">
                <div className="friend-photo" style={{ backgroundImage: `url(${m.photo})` }} onClick={() => navigate(`/chat/${m.id}`)} />
                <div className="friend-info" onClick={() => navigate(`/chat/${m.id}`)}>
                  <strong>{m.name}, {m.age}</strong>
                  <div className="hint" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <MapPin size={12} /> {m.city}
                  </div>
                  {m.study && <div className="hint" style={{ marginTop: 2, fontSize: '0.78rem' }}>{m.study}</div>}
                </div>
                <button className="msg-icon-btn" onClick={() => navigate(`/chat/${m.id}`)} aria-label={`Send melding til ${m.name}`}>
                  <MessageCircle size={22} />
                </button>
              </div>
            ))}
          </div>
        </>
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
              {!list || list.length === 0 ? (
                <p className="hint">Du har ingen venner å invitere ennå.</p>
              ) : (
                <div className="friend-list" style={{ maxHeight: 240, overflowY: 'auto', gap: 6 }}>
                  {list.map(m => {
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
