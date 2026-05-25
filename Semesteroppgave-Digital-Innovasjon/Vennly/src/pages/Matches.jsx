import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, MessageCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getMatches } from '../lib/matches'

export default function Matches() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [list, setList] = useState(null)

  useEffect(() => {
    if (user) getMatches(user.uid).then(setList)
  }, [user])

  return (
    <Layout title="Venner">
      <h1 className="screen-title">Dine venner</h1>

      {list === null && <p className="hint">Laster …</p>}

      {list && list.length === 0 && (
        <div className="empty">
          <Heart size={42} style={{ marginBottom: 12, opacity: 0.4 }} />
          <h3>Ingen venner ennå</h3>
          <p style={{ marginTop: 8 }}>Begynn å sveipe for å finne studievenner!</p>
          <button className="btn" style={{ marginTop: 20 }} onClick={() => navigate('/swipe')}>
            Til sveiping
          </button>
        </div>
      )}

      {list && list.length > 0 && (
        <div className="friend-list">
          {list.map((m) => (
            <div key={m.id} className="friend-card">
              <div
                className="friend-photo"
                style={{ backgroundImage: `url(${m.photo})` }}
                onClick={() => navigate(`/chat/${m.id}`)}
              />
              <div className="friend-info" onClick={() => navigate(`/chat/${m.id}`)}>
                <strong>{m.name}, {m.age}</strong>
                <div className="hint" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <MapPin size={12} /> {m.city}
                </div>
                {m.study && (
                  <div className="hint" style={{ marginTop: 2, fontSize: '0.78rem' }}>{m.study}</div>
                )}
              </div>
              <button
                className="msg-icon-btn"
                onClick={() => navigate(`/chat/${m.id}`)}
                aria-label={`Send melding til ${m.name}`}
              >
                <MessageCircle size={22} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
