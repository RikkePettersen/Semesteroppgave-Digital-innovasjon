import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings as SettingsIcon, ShieldCheck, GraduationCap, MapPin,
  Check, Pencil, Crown, Camera, Loader, X,
} from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { CITIES, STUDY_PROGRAMS, INTERESTS } from '../data/options'

function compressImage(file, maxSize = 1200, quality = 0.92) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > h) {
          if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize }
        } else {
          if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize }
        }
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function wordCount(text) {
  if (!text?.trim()) return 0
  return text.trim().split(/\s+/).length
}

export default function Profile() {
  const { profile, saveProfile } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile || {})
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [heroIdx, setHeroIdx] = useState(0)
  const [photoSlotIndex, setPhotoSlotIndex] = useState(null)
  const photoInputRef = useRef(null)

  if (!profile) return <Layout title="Profil"><p>Laster …</p></Layout>

  const viewPhotos = profile.photos?.length ? profile.photos : [profile.photo].filter(Boolean)
  const editPhotos = draft.photos?.length ? draft.photos : [draft.photo].filter(Boolean)

  const bioWords = wordCount(draft.bio || '')
  const bioOver = bioWords > 300

  function toggleInterest(i) {
    setDraft((d) => {
      const list = d.interests || []
      return { ...d, interests: list.includes(i) ? list.filter((x) => x !== i) : [...list, i] }
    })
  }

  function handleHeroTap(e) {
    if (viewPhotos.length <= 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = e.clientX - rect.left
    if (relX < rect.width / 2) {
      setHeroIdx(i => Math.max(0, i - 1))
    } else {
      setHeroIdx(i => Math.min(viewPhotos.length - 1, i + 1))
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const compressed = await compressImage(file)
      const current = [...editPhotos]
      if (photoSlotIndex !== null && photoSlotIndex < current.length) {
        current[photoSlotIndex] = compressed
      } else if (current.length < 5) {
        current.push(compressed)
      }
      const newPhotos = current.slice(0, 5)
      setDraft(d => ({ ...d, photos: newPhotos, photo: newPhotos[0] }))
      await saveProfile({ photos: newPhotos, photo: newPhotos[0] })
    } finally {
      setUploadingPhoto(false)
      setPhotoSlotIndex(null)
      e.target.value = ''
    }
  }

  function removePhoto(index) {
    const newPhotos = editPhotos.filter((_, i) => i !== index)
    setDraft(d => ({ ...d, photos: newPhotos, photo: newPhotos[0] || '' }))
  }

  function openSlot(index) {
    setPhotoSlotIndex(index)
    photoInputRef.current?.click()
  }

  async function save() {
    if (bioOver) return
    setSaving(true)
    await saveProfile({
      name: draft.name,
      age: Number(draft.age),
      city: draft.city,
      study: draft.study,
      bio: draft.bio || '',
      interests: draft.interests || [],
      photos: draft.photos || [],
      photo: (draft.photos || [])[0] || draft.photo || '',
    })
    setSaving(false)
    setEditing(false)
    setHeroIdx(0)
  }

  const action = (
    <button className="navbtn" style={{ flex: 'none' }} onClick={() => navigate('/innstillinger')}>
      <SettingsIcon size={24} />
    </button>
  )

  return (
    <Layout title="Profil" action={action}>
      {!editing && (
        <>
          <div className="profile-hero" onClick={handleHeroTap}>
            <img src={viewPhotos[heroIdx] || viewPhotos[0]} alt={profile.name} />

            {viewPhotos.length > 1 && (
              <div className="photo-dots hero-dots">
                {viewPhotos.map((_, i) => (
                  <span key={i} className={`photo-dot${i === heroIdx ? ' active' : ''}`} />
                ))}
              </div>
            )}

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

          <button className="btn btn-outline" onClick={() => { setDraft({ ...profile }); setEditing(true) }}>
            <Pencil size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Rediger profil
          </button>

          {!profile.plus && (
            <div className="plus-banner" style={{ marginTop: 16 }}>
              <h3><Crown size={20} /> Vennly Plus</h3>
              <ul>
                <li><Check size={15} /> Ubegrenset med likes</li>
                <li><Check size={15} /> Se hvem som har likt deg</li>
              </ul>
              <button className="btn" onClick={() => saveProfile({ plus: true })}>Oppgrader for 49 kr/mnd</button>
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

          {profile.bio && (
            <>
              <div className="section-title">Om meg</div>
              <div className="card-box">{profile.bio}</div>
            </>
          )}

          <div className="section-title">Interesser</div>
          <div className="card-box">
            <div className="chips">
              {(profile.interests || []).map((i) => <span key={i} className="chip-static">{i}</span>)}
            </div>
          </div>
        </>
      )}

      {editing && (
        <>
          <h1 className="screen-title">Rediger profil</h1>

          <div className="section-title">Bilder ({editPhotos.length}/5)</div>
          <div className="photo-grid">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`photo-slot${editPhotos[i] ? ' filled' : ''}${i === 0 ? ' main-slot' : ''}`}
                onClick={() => !editPhotos[i] && openSlot(i)}
              >
                {editPhotos[i] ? (
                  <>
                    <img src={editPhotos[i]} alt={`Bilde ${i + 1}`} />
                    {i === 0 && <span className="main-label">Hoved</span>}
                    <div className="slot-actions">
                      <button className="slot-btn replace" onClick={(e) => { e.stopPropagation(); openSlot(i) }}>
                        <Camera size={14} />
                      </button>
                      <button className="slot-btn remove" onClick={(e) => { e.stopPropagation(); removePhoto(i) }}>
                        <X size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="slot-add">+</span>
                )}
              </div>
            ))}
          </div>

          {uploadingPhoto && (
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 12 }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite', verticalAlign: -2, marginRight: 6 }} />
              Laster opp …
            </p>
          )}

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />

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
            <textarea
              rows={4}
              value={draft.bio || ''}
              placeholder="Fortell litt om deg selv …"
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            />
            <div className={`bio-counter${bioOver ? ' over' : ''}`}>
              {bioWords} / 300 ord
            </div>
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
            <button className="btn" style={{ flex: 2 }} disabled={saving || bioOver} onClick={save}>
              {saving ? 'Lagrer …' : 'Lagre'}
            </button>
          </div>
        </>
      )}
    </Layout>
  )
}
