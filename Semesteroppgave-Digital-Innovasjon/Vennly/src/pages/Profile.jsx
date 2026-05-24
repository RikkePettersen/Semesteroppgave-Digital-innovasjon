import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings as SettingsIcon, ShieldCheck, GraduationCap, MapPin,
  Check, Pencil, Star, Crown,
} from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { CITIES, STUDY_PROGRAMS, INTERESTS } from '../data/options'

export default function Profile() {
  const { profile, saveProfile } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile || {})
  const [saving, setSaving] = useState(false)

  if (!profile) return <Layout title="Profil"><p>Laster …</p></Layout>

  function toggleInterest(i) {
    setDraft((d) => {
      const list = d.interests || []
      return { ...d, interests: list.includes(i) ? list.filter((x) => x !== i) : [...list, i] }
    })
  }

  async function save() {
    setSaving(true)
    await saveProfile({
      name: draft.name, age: Number(draft.age), city: draft.city,
      study: draft.study, bio: draft.bio || '', interests: draft.interests || [],
    })
    setSaving(false)
    setEditing(false)
  }

  const action = (
    <button className="navbtn" style={{ flex: 'none' }} onClick={() => navigate('/innstillinger')}>
      <SettingsIcon size={24} />
    </button>
  )

  return (
    <Layout title="Profil" action={action}>
      {/* ---------- VISNINGSMODUS ---------- */}
      {!editing && (
        <>
          <div className="profile-hero">
            <img src={profile.photo} alt={profile.name} />
            <div className="name-tag">
              <h2>{profile.name}, {profile.age}</h2>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                <MapPin size={15} /> {profile.city}
                {profile.verifiedStudent && (
                  <span className="verified"><ShieldCheck size={13} /> Verifisert student</span>
                )}
              </div>
            </div>
          </div>

          <button className="btn btn-outline" onClick={() => { setDraft(profile); setEditing(true) }}>
            <Pencil size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Rediger profil
          </button>

          {!profile.plus && (
            <div className="plus-banner" style={{ marginTop: 16 }}>
              <h3><Crown size={20} /> Vennly Plus</h3>
              <ul>
                <li><Star size={15} /> Ubegrenset med likes</li>
                <li><Check size={15} /> Se hvem som har likt deg</li>
                <li><Check size={15} /> 5 superlikes hver uke</li>
                <li><Check size={15} /> Bytt by – møt studenter i hele Norge</li>
              </ul>
              <button className="btn" onClick={() => saveProfile({ plus: true })}>
                Oppgrader for 49 kr/mnd
              </button>
            </div>
          )}
          {profile.plus && (
            <div className="card-box center" style={{ marginTop: 16 }}>
              <Crown size={28} color="#FD267A" />
              <p style={{ fontWeight: 700, marginTop: 6 }}>Du har Vennly Plus 👑</p>
            </div>
          )}

          <div className="section-title">Studie</div>
          <div className="card-box">
            <div className="row">
              <span className="label"><GraduationCap size={18} /> Studieprogram</span>
              <span className="val">{profile.study}</span>
            </div>
            <div className="row">
              <span className="label"><MapPin size={18} /> Studiested</span>
              <span className="val">{profile.city}</span>
            </div>
          </div>

          {profile.bio && (<>
            <div className="section-title">Om meg</div>
            <div className="card-box">{profile.bio}</div>
          </>)}

          <div className="section-title">Interesser</div>
          <div className="card-box">
            <div className="chips">
              {(profile.interests || []).map((i) => (
                <span key={i} className="chip-static">{i}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ---------- REDIGERINGSMODUS ---------- */}
      {editing && (
        <>
          <h1 className="screen-title">Rediger profil</h1>
          <div className="field">
            <label>Fornavn</label>
            <input value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Alder</label>
            <input type="number" value={draft.age || ''} onChange={(e) => setDraft({ ...draft, age: e.target.value })} />
          </div>
          <div className="field">
            <label>By / studiested</label>
            <select value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })}>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Studieprogram</label>
            <select value={draft.study} onChange={(e) => setDraft({ ...draft, study: e.target.value })}>
              {STUDY_PROGRAMS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Om meg</label>
            <textarea rows={3} value={draft.bio || ''} placeholder="Fortell litt om deg selv …"
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
          </div>
          <div className="field">
            <label>Interesser</label>
            <div className="chips">
              {INTERESTS.map((i) => (
                <button type="button" key={i}
                  className={'chip' + ((draft.interests || []).includes(i) ? ' selected' : '')}
                  onClick={() => toggleInterest(i)}>{i}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>Avbryt</button>
            <button className="btn" style={{ flex: 2 }} disabled={saving} onClick={save}>
              {saving ? 'Lagrer …' : 'Lagre'}
            </button>
          </div>
        </>
      )}
    </Layout>
  )
}