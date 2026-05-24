import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bell, Moon, MapPin, ShieldAlert, Eye, LogOut, Crown,
} from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { CITIES } from '../data/options'

export default function Settings() {
  const { profile, saveProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState(profile?.notifications ?? true)
  const [darkMode, setDarkMode] = useState(profile?.darkMode ?? false)
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(profile?.showVerifiedOnly ?? false)
  const [maxDistance, setMaxDistance] = useState(profile?.maxDistance ?? 50)
  const [discoveryCity, setDiscoveryCity] = useState(profile?.discoveryCity || profile?.city || CITIES[0])

  function update(field, value, setter) {
    setter(value)
    saveProfile({ [field]: value })
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const action = (
    <button className="navbtn" style={{ flex: 'none' }} onClick={() => navigate('/profil')}>
      <ArrowLeft size={24} />
    </button>
  )

  return (
    <Layout title="Innstillinger" action={action}>
      <h1 className="screen-title">Innstillinger</h1>

      {/* ---- Oppdagelse ---- */}
      <div className="section-title">Oppdagelse</div>
      <div className="card-box">
        <div className="row">
          <span className="label"><MapPin size={18} /> Vis studenter i</span>
          <select value={discoveryCity}
            onChange={(e) => update('discoveryCity', e.target.value, setDiscoveryCity)}
            style={{ border: 'none', color: 'var(--muted)', background: 'none', fontWeight: 600 }}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="label"><MapPin size={18} /> Maks avstand</span>
            <span className="val">{maxDistance} km</span>
          </div>
          <input type="range" min={5} max={200} value={maxDistance}
            onChange={(e) => update('maxDistance', Number(e.target.value), setMaxDistance)}
            style={{ accentColor: '#FD297B', width: '100%' }} />
        </div>
        <div className="row">
          <span className="label"><Eye size={18} /> Kun verifiserte studenter</span>
          <Toggle checked={showVerifiedOnly}
            onChange={(v) => update('showVerifiedOnly', v, setShowVerifiedOnly)} />
        </div>
      </div>

      {/* ---- Varsler og visning ---- */}
      <div className="section-title">Varsler og visning</div>
      <div className="card-box">
        <div className="row">
          <span className="label"><Bell size={18} /> Push-varsler</span>
          <Toggle checked={notifications} onChange={(v) => update('notifications', v, setNotifications)} />
        </div>
        <div className="row">
          <span className="label"><Moon size={18} /> Mørk modus</span>
          <Toggle checked={darkMode} onChange={(v) => update('darkMode', v, setDarkMode)} />
        </div>
      </div>

      {/* ---- Medlemskap ---- */}
      <div className="section-title">Medlemskap</div>
      <div className="card-box">
        <div className="row">
          <span className="label"><Crown size={18} /> Vennly Plus</span>
          <span className="val">{profile?.plus ? 'Aktiv 👑' : 'Ikke aktiv'}</span>
        </div>
      </div>

      {/* ---- Trygghet (ansvarlig design) ---- */}
      <div className="section-title">Trygghet</div>
      <div className="card-box">
        <div className="row">
          <span className="label"><ShieldAlert size={18} /> Retningslinjer for trygghet</span>
          <span className="val">›</span>
        </div>
        <div className="row">
          <span className="label"><ShieldAlert size={18} /> Rapporter et problem</span>
          <span className="val">›</span>
        </div>
      </div>

      <button className="btn btn-ghost" style={{ marginTop: 8, color: 'var(--nope)' }} onClick={handleLogout}>
        <LogOut size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Logg ut
      </button>
      <p className="hint center" style={{ marginTop: 16 }}>Vennly v1.0 · Laget for studenter i Norge</p>
    </Layout>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="slider" />
    </label>
  )
}