import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin } from 'lucide-react'
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
    <Layout title="Matcher">
      <h1 className="screen-title">Dine matcher</h1>

      {list === null && <p className="hint">Laster …</p>}

      {list && list.length === 0 && (
        <div className="empty">
          <Heart size={42} style={{ marginBottom: 12, opacity: 0.4 }} />
          <h3>Ingen matcher ennå</h3>
          <p style={{ marginTop: 8 }}>Begynn å sveipe for å finne studievenner!</p>
          <button className="btn" style={{ marginTop: 20 }} onClick={() => navigate('/swipe')}>
            Til sveiping
          </button>
        </div>
      )}

      {list && list.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {list.map((m) => (
            <div key={m.id} className="card-box" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate('/chat')}>
              <div style={{ height: 150, background: `url(${m.photo}) center/cover` }} />
              <div style={{ padding: 12 }}>
                <strong>{m.name}, {m.age}</strong>
                <div className="hint" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} /> {m.city}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}