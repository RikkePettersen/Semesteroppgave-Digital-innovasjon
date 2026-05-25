import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bell, Moon, MapPin, ShieldAlert, Eye, LogOut, Crown,
  Navigation, Loader,
} from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { CITIES } from '../data/options'
import { getCurrentPosition, reverseGeocode, fuzzyCoords } from '../lib/location'

export default function Settings() {
  const { profile, saveProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [notifications,    setNotifications]    = useState(profile?.notifications    ?? true)
  const [darkMode,         setDarkMode]         = useState(profile?.darkMode         ?? false)
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(profile?.showVerifiedOnly ?? false)
  const [maxDistance,      setMaxDistance]      = useState(profile?.maxDistance      ?? 50)
  const [discoveryCity,    setDiscoveryCity]    = useState(profile?.discoveryCity || profile?.city || CITIES[0])
  const [locStatus,        setLocStatus]        = useState(
    profile?.coords ? 'active' : 'idle'   // idle | loading | active | error
  )
  const [locLabel,  setLocLabel]  = useState(profile?.locationLabel || null)
  const [locError,  setLocError]  = useState(null)

  function update(field, value, setter) {
    setter(value)
    saveProfile({ [field]: value })
  }

  async function handleEnableLocation() {
    setLocStatus('loading')
    setLocError(null)
    try {
      const exact  = await getCurrentPosition()
      // Stedsnavn hentes fra eksakte koordinater (sendes til Nominatim én gang)
      const label  = await reverseGeocode(exact.lat, exact.lng)
      // Kun unøyaktige koordinater (~1 km nøyaktighet) lagres i databasen
      const stored = fuzzyCoords(exact.lat, exact.lng)
      setLocStatus('active')
      setLocLabel(label)
      saveProfile({ coords: stored, locationLabel: label })
    } catch (err) {
      setLocStatus('error')
      setLocError(err.message)
    }
  }

  function handleDisableLocation() {
    setLocStatus('idle')
    setLocLabel(null)
    saveProfile({ coords: null, locationLabel: null })
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

      {/* ---- Posisjon ---- */}
      <div className="section-title">Posisjon</div>
      <div className="card-box">
        <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label"><Navigation size={18} /> GPS-posisjon</span>
            {locStatus === 'active' && (
              <span style={{ fontSize: '0.78rem', color: 'var(--like)', fontWeight: 700 }}>● Aktiv</span>
            )}
          </div>

          {locStatus === 'active' && locLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--muted)' }}>
              <MapPin size={14} /> {locLabel}
            </div>
          )}

          {locError && <p className="error" style={{ marginTop: 0 }}>{locError}</p>}

          {locStatus !== 'active' ? (
            <button
              className="btn"
              style={{ padding: '10px 14px', fontSize: '0.9rem' }}
              onClick={handleEnableLocation}
              disabled={locStatus === 'loading'}
            >
              {locStatus === 'loading'
                ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite', verticalAlign: -3, marginRight: 6 }} />Henter posisjon …</>
                : <><Navigation size={15} style={{ verticalAlign: -3, marginRight: 6 }} />Aktiver posisjon</>}
            </button>
          ) : (
            <button
              className="btn btn-ghost"
              style={{ padding: '10px 14px', fontSize: '0.9rem' }}
              onClick={handleDisableLocation}
            >
              Skru av posisjonsdeling
            </button>
          )}

          <div className="privacy-note">
            <p>🔒 <strong>Personvern:</strong></p>
            <ul>
              <li>Kun omtrentlig posisjon (~1 km nøyaktighet) lagres – ikke eksakt GPS.</li>
              <li>Avstand beregnes i nettleseren din og deles <em>ikke</em> med andre brukere.</li>
              <li>Stedsnavn hentes via OpenStreetMap (Nominatim) – dette er det eneste tidspunktet eksakte koordinater forlater enheten din.</li>
              <li>Du kan skru av posisjonsdeling og slette dataene når som helst.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ---- Oppdagelse ---- */}
      <div className="section-title">Oppdagelse</div>
      <div className="card-box">
        <div className="row">
          <span className="label"><MapPin size={18} /> Vis studenter i</span>
          <select
            value={discoveryCity}
            onChange={(e) => update('discoveryCity', e.target.value, setDiscoveryCity)}
            style={{ border: 'none', color: 'var(--muted)', background: 'none', fontWeight: 600 }}
          >
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="label"><MapPin size={18} /> Maks avstand</span>
            <span className="val" style={{ fontWeight: 700, color: 'var(--gold)' }}>
              {maxDistance === 200 ? '200+ km' : `${maxDistance} km`}
            </span>
          </div>
          <input
            type="range" min={5} max={200} step={5} value={maxDistance}
            onChange={(e) => update('maxDistance', Number(e.target.value), setMaxDistance)}
            style={{ accentColor: 'var(--gold)', width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)' }}>
            <span>5 km</span><span>200+ km</span>
          </div>
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

      {/* ---- Trygghet ---- */}
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
