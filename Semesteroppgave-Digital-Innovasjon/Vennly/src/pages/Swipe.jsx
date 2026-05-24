import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Heart, Star, ShieldCheck, GraduationCap, MapPin, RotateCcw } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { SAMPLE_PROFILES } from '../data/sampleProfiles'
import { addMatch } from '../lib/matches'

const SWIPE_THRESHOLD = 110   // hvor langt man må dra for at det teller

export default function Swipe() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()

  // Sorter stokken slik at profiler med flere felles interesser kommer øverst.
  const [deck, setDeck] = useState([])
  const [matched, setMatched] = useState(null)   // profil man nettopp matchet med

  useEffect(() => {
    const mine = profile?.interests || []
    const sorted = [...SAMPLE_PROFILES].sort((a, b) =>
      overlap(b.interests, mine) - overlap(a.interests, mine)
    )
    setDeck(sorted)
  }, [profile])

  const top = deck[0]

  function handleDecision(liked) {
    if (!top) return
    // Felles interesser øker sjansen for match (enkel demo-logikk).
    const shared = overlap(top.interests, profile?.interests || [])
    const isMatch = liked && (shared >= 2 || Math.random() > 0.4)

    if (isMatch) {
      addMatch(user.uid, top)
      setMatched(top)
    }
    setDeck((d) => d.slice(1))
  }

  return (
    <Layout title="vennly">
      {top ? (
        <>
          <div className="deck">
            {deck.slice(0, 3).reverse().map((p, i, arr) => {
              const isTop = i === arr.length - 1
              return (
                <Card
                  key={p.id}
                  profile={p}
                  draggable={isTop}
                  onDecision={handleDecision}
                  myInterests={profile?.interests || []}
                />
              )
            })}
          </div>

          <div className="swipe-actions">
            <button className="round nope" onClick={() => handleDecision(false)} aria-label="Nei takk">
              <X size={30} strokeWidth={3} />
            </button>
            <button className="round star small" aria-label="Superlike (Vennly Plus)">
              <Star size={22} fill="currentColor" />
            </button>
            <button className="round like" onClick={() => handleDecision(true)} aria-label="Lik">
              <Heart size={30} fill="currentColor" />
            </button>
          </div>
        </>
      ) : (
        <div className="empty">
          <RotateCcw size={42} style={{ marginBottom: 12, opacity: 0.4 }} />
          <h3>Ingen flere profiler akkurat nå</h3>
          <p style={{ marginTop: 8 }}>Kom tilbake senere – nye studenter dukker opp hele tiden!</p>
          <button className="btn" style={{ marginTop: 20 }}
            onClick={() => setDeck([...SAMPLE_PROFILES])}>Vis profilene på nytt</button>
        </div>
      )}

      {matched && (
        <MatchOverlay
          me={profile}
          them={matched}
          onClose={() => setMatched(null)}
          onMessage={() => navigate('/chat')}
        />
      )}
    </Layout>
  )
}

/* ---- Et enkelt swipe-kort med pointer-drag ------------------------------ */
function Card({ profile, draggable, onDecision, myInterests }) {
  const ref = useRef(null)
  const start = useRef(null)
  const [dragging, setDragging] = useState(false)

  function setTransform(dx, dy, animate = false) {
    const el = ref.current
    if (!el) return
    const rot = dx / 18
    el.style.transition = animate ? 'transform 0.3s ease' : 'none'
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`
    const like = el.querySelector('.stamp.like')
    const nope = el.querySelector('.stamp.nope')
    if (like) like.style.opacity = Math.max(0, Math.min(1, dx / SWIPE_THRESHOLD))
    if (nope) nope.style.opacity = Math.max(0, Math.min(1, -dx / SWIPE_THRESHOLD))
  }

  function onDown(e) {
    if (!draggable) return
    const point = e.touches ? e.touches[0] : e
    start.current = { x: point.clientX, y: point.clientY }
    setDragging(true)
  }
  function onMove(e) {
    if (!start.current) return
    const point = e.touches ? e.touches[0] : e
    setTransform(point.clientX - start.current.x, point.clientY - start.current.y)
  }
  function onUp(e) {
    if (!start.current) return
    const point = e.changedTouches ? e.changedTouches[0] : e
    const dx = point.clientX - start.current.x
    start.current = null
    setDragging(false)

    if (dx > SWIPE_THRESHOLD) {
      setTransform(600, 0, true)
      setTimeout(() => onDecision(true), 200)
    } else if (dx < -SWIPE_THRESHOLD) {
      setTransform(-600, 0, true)
      setTimeout(() => onDecision(false), 200)
    } else {
      setTransform(0, 0, true)   // snap tilbake
    }
  }

  // Globale lyttere mens man drar (så man kan dra utenfor kortet)
  useEffect(() => {
    if (!dragging) return
    const move = (e) => onMove(e)
    const up = (e) => onUp(e)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
    }
  }, [dragging])

  return (
    <div
      ref={ref}
      className="swipe-card"
      style={{ backgroundImage: `url(${profile.photo})` }}
      onMouseDown={onDown}
      onTouchStart={onDown}
    >
      <div className="stamp like">LIK</div>
      <div className="stamp nope">NEI</div>
      <div className="overlay" />
      <div className="card-info">
        <h2>
          {profile.name} <span className="age">{profile.age}</span>
          {profile.verified && (
            <span className="verified"><ShieldCheck size={13} /> Verifisert</span>
          )}
        </h2>
        <div className="meta"><MapPin size={15} /> {profile.city}
          <span style={{ opacity: 0.6 }}>•</span>
          <GraduationCap size={15} /> {profile.study}</div>
        <p className="bio">{profile.bio}</p>
        <div className="chips">
          {profile.interests.map((i) => (
            <span key={i} className="chip-static"
              style={myInterests.includes(i)
                ? { background: 'rgba(255,255,255,0.5)', fontWeight: 700 } : undefined}>
              {i}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---- Match-popup (tilbakemelding/feedback-prinsippet) ------------------- */
function MatchOverlay({ me, them, onClose, onMessage }) {
  return (
    <div className="match-overlay">
      <div className="match-photos">
        <img src={me?.photo} alt="Deg" />
        <img src={them.photo} alt={them.name} />
      </div>
      <h2>Det er en match! 🎉</h2>
      <p>Du og {them.name} liker hverandre.</p>
      <button className="btn" style={{ maxWidth: 280 }} onClick={onMessage}>
        Send en melding
      </button>
      <button className="btn btn-ghost" style={{ maxWidth: 280, marginTop: 10 }} onClick={onClose}>
        Fortsett å sveipe
      </button>
    </div>
  )
}

function overlap(a = [], b = []) {
  return a.filter((x) => b.includes(x)).length
}