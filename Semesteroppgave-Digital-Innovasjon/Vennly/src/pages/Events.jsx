import { useState } from 'react'
import { MapPin, Users, CalendarDays, Clock, Plus, X, ChevronLeft } from 'lucide-react'
import Layout from '../components/Layout'

const DAYS   = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag']
const MONTHS = ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember']

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T12:00:00')
  return `${DAYS[d.getDay()]} ${d.getDate()}. ${MONTHS[d.getMonth()]}`
}

const EMOJIS = [
  '🌳','🎲','🍕','🎮','🎭','🎵','⚽','🏃','🎨','📚',
  '☕','🍺','🎉','🏔️','🎤','🎬','🃏','🎯','🎸','🏊',
  '🧗','🌊','🏂','⛺','🍜','🎪','🎷','🌙','🏋️','🎻',
  '🐾','🌸','🍦','🎡','🚴','🧩','🍿','🎃','🏄','🌮',
]

const INITIAL_EVENTS = [
  {
    id: 'e1',
    emoji: '🌳',
    title: 'Tur i parken',
    description: 'Bli med på en hyggelig tur i parken med andre studenter. Ta med vannflaske og godt humør!',
    date: 'Lørdag 31. mai',
    time: '13:00',
    location: 'Studentparken',
    totalSpots: 10,
    takenSpots: 3,
  },
  {
    id: 'e2',
    emoji: '🎲',
    title: 'Spillkveld',
    description: 'Ta med favorittbrettspillet ditt og bli kjent med nye studenter over en morsom spillkveld.',
    date: 'Fredag 6. juni',
    time: '18:00',
    location: 'Studenthuset',
    totalSpots: 5,
    takenSpots: 1,
  },
]

const EMPTY_FORM = {
  emoji: '🎉',
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  totalSpots: '',
}

export default function Events() {
  const [events, setEvents]       = useState(INITIAL_EVENTS)
  const [joined, setJoined]       = useState({})
  const [creating, setCreating]   = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [errors, setErrors]       = useState({})

  function toggleJoin(id) {
    setJoined(j => ({ ...j, [id]: !j[id] }))
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setErrors({})
    setEmojiOpen(false)
    setCreating(true)
  }

  function validate() {
    const e = {}
    if (!form.title.trim())       e.title    = 'Tittel mangler'
    if (!form.date)                e.date     = 'Dato mangler'
    if (!form.time)                e.time     = 'Klokkeslett mangler'
    if (!form.location.trim())    e.location = 'Sted mangler'
    const spots = Number(form.totalSpots)
    if (!spots || spots < 2)      e.totalSpots = 'Minst 2 plasser'
    return e
  }

  function submit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const newEvent = {
      id: 'u' + Date.now(),
      emoji:      form.emoji,
      title:      form.title.trim(),
      description: form.description.trim(),
      date:       formatDate(form.date),
      time:       form.time,
      location:   form.location.trim(),
      totalSpots: Number(form.totalSpots),
      takenSpots: 0,
    }
    setEvents(ev => [newEvent, ...ev])
    setCreating(false)
  }

  function field(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const addBtn = (
    <button
      className="navbtn"
      style={{ flex: 'none', background: 'var(--grad)', borderRadius: '50%', width: 38, height: 38, color: '#fff' }}
      onClick={openCreate}
      aria-label="Opprett arrangement"
    >
      <Plus size={22} />
    </button>
  )

  if (creating) {
    return (
      <Layout title="Nytt arrangement" action={
        <button className="navbtn" style={{ flex: 'none' }} onClick={() => setCreating(false)}>
          <X size={24} />
        </button>
      }>
        <button
          onClick={() => setCreating(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 600, marginBottom: 18, background: 'none' }}
        >
          <ChevronLeft size={18} /> Tilbake
        </button>

        {/* Emoji + tittel */}
        <div className="field">
          <label>Emoji og tittel</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="emoji-pick-btn"
              onClick={() => setEmojiOpen(o => !o)}
              title="Velg emoji"
            >
              {form.emoji}
            </button>
            <input
              style={{ flex: 1 }}
              placeholder="Navn på arrangementet"
              value={form.title}
              onChange={e => field('title', e.target.value)}
            />
          </div>
          {errors.title && <p className="error">{errors.title}</p>}
        </div>

        {emojiOpen && (
          <div className="emoji-grid">
            {EMOJIS.map(em => (
              <button
                key={em}
                type="button"
                className={`emoji-option${form.emoji === em ? ' selected' : ''}`}
                onClick={() => { field('emoji', em); setEmojiOpen(false) }}
              >
                {em}
              </button>
            ))}
          </div>
        )}

        {/* Beskrivelse */}
        <div className="field">
          <label>Beskrivelse (valgfri)</label>
          <textarea
            rows={3}
            placeholder="Hva skjer? Ta med info om hva deltagerne bør vite …"
            value={form.description}
            onChange={e => field('description', e.target.value)}
          />
        </div>

        {/* Dato og tid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="field">
            <label>Dato</label>
            <input type="date" value={form.date} onChange={e => field('date', e.target.value)} />
            {errors.date && <p className="error">{errors.date}</p>}
          </div>
          <div className="field">
            <label>Klokkeslett</label>
            <input type="time" value={form.time} onChange={e => field('time', e.target.value)} />
            {errors.time && <p className="error">{errors.time}</p>}
          </div>
        </div>

        {/* Sted */}
        <div className="field">
          <label>Sted</label>
          <input
            placeholder="Hvor skal dere møtes?"
            value={form.location}
            onChange={e => field('location', e.target.value)}
          />
          {errors.location && <p className="error">{errors.location}</p>}
        </div>

        {/* Antall plasser */}
        <div className="field">
          <label>Maks antall deltagere</label>
          <input
            type="number"
            min={2}
            max={200}
            placeholder="F.eks. 10"
            value={form.totalSpots}
            onChange={e => field('totalSpots', e.target.value)}
          />
          {errors.totalSpots && <p className="error">{errors.totalSpots}</p>}
        </div>

        {/* Forhåndsvisning */}
        {form.title && (
          <div style={{ marginBottom: 20 }}>
            <div className="section-title">Forhåndsvisning</div>
            <div className="event-card" style={{ opacity: 0.85 }}>
              <div className="event-header">
                <span className="event-emoji">{form.emoji}</span>
                <div style={{ flex: 1 }}>
                  <h3 className="event-title">{form.title || '…'}</h3>
                </div>
              </div>
              {form.description && <p className="event-desc">{form.description}</p>}
              <div className="event-meta">
                {form.date     && <span><CalendarDays size={14} /> {formatDate(form.date)}</span>}
                {form.time     && <span><Clock size={14} /> {form.time}</span>}
                {form.location && <span><MapPin size={14} /> {form.location}</span>}
              </div>
              <div className="event-footer">
                <div className="event-spots">
                  <Users size={15} />
                  {form.totalSpots ? `${form.totalSpots} plasser` : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        <button className="btn" onClick={submit}>Publiser arrangement</button>
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => setCreating(false)}>Avbryt</button>
      </Layout>
    )
  }

  return (
    <Layout title="Skjer" action={addBtn}>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 16 }}>
        Arrangementer for studenter i din by
      </p>

      {events.length === 0 && (
        <div className="empty">
          <CalendarDays size={42} style={{ marginBottom: 12, opacity: 0.35 }} />
          <h3>Ingen arrangementer ennå</h3>
          <p style={{ marginTop: 8 }}>Vær den første – opprett noe!</p>
          <button className="btn" style={{ marginTop: 20, maxWidth: 240 }} onClick={openCreate}>
            <Plus size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Opprett arrangement
          </button>
        </div>
      )}

      {events.map((ev) => {
        const spotsLeft = ev.totalSpots - ev.takenSpots - (joined[ev.id] ? 1 : 0)
        const isFull   = spotsLeft <= 0
        const isJoined = !!joined[ev.id]

        return (
          <div key={ev.id} className="event-card">
            <div className="event-header">
              <span className="event-emoji">{ev.emoji}</span>
              <div style={{ flex: 1 }}>
                <h3 className="event-title">{ev.title}</h3>
              </div>
            </div>

            {ev.description && <p className="event-desc">{ev.description}</p>}

            <div className="event-meta">
              <span><CalendarDays size={14} /> {ev.date}</span>
              <span><Clock size={14} /> {ev.time}</span>
              <span><MapPin size={14} /> {ev.location}</span>
            </div>

            <div className="event-footer">
              <div className={`event-spots${isFull ? ' full' : spotsLeft <= 2 ? ' few' : ''}`}>
                <Users size={15} />
                {isFull
                  ? 'Fullt'
                  : `${spotsLeft} ledig${spotsLeft !== 1 ? 'e' : ''} plass${spotsLeft !== 1 ? 'er' : ''}`}
              </div>
              <button
                className={`event-btn${isJoined ? ' joined' : ''}${isFull && !isJoined ? ' disabled' : ''}`}
                onClick={() => (!isFull || isJoined) && toggleJoin(ev.id)}
                disabled={isFull && !isJoined}
              >
                {isJoined ? 'Meldt på ✓' : 'Bli med'}
              </button>
            </div>
          </div>
        )
      })}
    </Layout>
  )
}
