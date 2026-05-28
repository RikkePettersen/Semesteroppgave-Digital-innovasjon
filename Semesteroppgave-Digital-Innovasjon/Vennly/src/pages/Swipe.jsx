import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Heart, ShieldCheck, GraduationCap, MapPin, RotateCcw, Navigation } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { db, isFirebaseConfigured } from '../firebase'
import { SAMPLE_PROFILES } from '../data/sampleProfiles'
import { addMatch, getMatches } from '../lib/matches'
import { getDistance, formatDistance } from '../lib/location'

const SWIPE_THRESHOLD = 110
const seenKey = (uid) => `vennly_seen_${uid}`

async function fetchRealUsers(currentUid) {
  if (!isFirebaseConfigured) return []
  try {
    const snap = await getDocs(collection(db, 'users'))
    return snap.docs
      .filter(d => d.id !== currentUid && d.data().name && d.data().age)
      .map(d => {
        const u = d.data()
        return {
          id:        d.id,
          name:      u.name,
          age:       u.age,
          city:      u.city       || '',
          study:     u.study      || '',
          bio:       u.bio        || '',
          interests: u.interests  || [],
          photo:     u.photo      || '',
          photos:    u.photos     || (u.photo ? [u.photo] : []),
          coords:    u.coords     || null,
          verified:  u.verifiedStudent || false,
          isRealUser: true,
        }
      })
  } catch {
    return []
  }
}

function getSeenIds(uid) {
  return new Set(JSON.parse(localStorage.getItem(seenKey(uid)) || '[]'))
}
function markSeen(uid, id) {
  const seen = getSeenIds(uid)
  seen.add(id)
  localStorage.setItem(seenKey(uid), JSON.stringify([...seen]))
}

export default function Swipe() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [deck,    setDeck]    = useState([])
  const [nearby,  setNearby]  = useState([])
  const [matched, setMatched] = useState(null)
  const [filter,  setFilter]  = useState('alle')

  const userCoords  = profile?.coords      || null
  const maxDistance = profile?.maxDistance ?? 200

  useEffect(() => {
    if (!user) return
    const mine = profile?.interests || []

    async function buildDeck() {
      const [matches, realUsers] = await Promise.all([
        getMatches(user.uid),
        fetchRealUsers(user.uid),
      ])

      const matchedIds = new Set(matches.map(m => m.id))
      const seenIds    = getSeenIds(user.uid)
      const excluded   = new Set([...matchedIds, ...seenIds, user.uid])

      const allProfiles = [
        ...realUsers,
        ...SAMPLE_PROFILES.filter(p => !realUsers.find(r => r.id === p.id)),
      ]

      const withDistance = allProfiles
        .filter(p => !excluded.has(p.id))
        .map(p => ({
          ...p,
          distance: userCoords && p.coords
            ? getDistance(userCoords.lat, userCoords.lng, p.coords.lat, p.coords.lng)
            : null,
        }))

      const sorted = [...withDistance].sort((a, b) =>
        overlap(b.interests, mine) - overlap(a.interests, mine)
      )

      setDeck(sorted)
      setNearby(
        withDistance
          .filter(p => p.distance !== null && p.distance <= 50)
          .sort((a, b) => a.distance - b.distance)
      )
    }

    buildDeck()
  }, [user, profile])

  const activeDeck = filter === 'nærheten'
    ? deck.filter(p => p.distance !== null && p.distance <= (maxDistance === 200 ? Infinity : maxDistance))
    : maxDistance < 200 && userCoords
      ? deck.filter(p => p.distance === null || p.distance <= maxDistance)
      : deck

  const top = activeDeck[0]

  function handleDecision(liked) {
    if (!top) return
    markSeen(user.uid, top.id)
    const shared  = overlap(top.interests, profile?.interests || [])
    const isMatch = liked && (shared >= 2 || Math.random() > 0.4)
    if (isMatch) {
      addMatch(user.uid, top)
      setMatched(top)
    }
    setDeck(d => d.filter(p => p.id !== top.id))
  }

  return (
    <Layout title="vennly">

      {/* Folk i nærheten-banner */}
      {nearby.length > 0 && (
        <div className="nearby-banner">
          <Navigation size={14} />
          <span><strong>{nearby.length}</strong> folk i nærheten av deg</span>
          <div className="nearby-avatars">
            {nearby.slice(0, 4).map(p => (
              <img key={p.id} src={p.photo} alt={p.name} className="nearby-avatar" />
            ))}
          </div>
        </div>
      )}

      {/* Filter-tabs */}
      {userCoords && (
        <div className="filter-tabs">
          <button
            className={`filter-tab${filter === 'alle' ? ' active' : ''}`}
            onClick={() => setFilter('alle')}
          >Alle</button>
          <button
            className={`filter-tab${filter === 'nærheten' ? ' active' : ''}`}
            onClick={() => setFilter('nærheten')}
          >
            <Navigation size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
            I nærheten
          </button>
        </div>
      )}


      {top ? (
        <>
          <div className="deck">
            {activeDeck.slice(0, 3).reverse().map((p, i, arr) => {
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
            <button className="round like" onClick={() => handleDecision(true)} aria-label="Lik">
              <Heart size={30} fill="currentColor" />
            </button>
          </div>
        </>
      ) : (
        <div className="empty">
          <RotateCcw size={42} style={{ marginBottom: 12, opacity: 0.4 }} />
          <h3>Ingen flere profiler</h3>
          <p style={{ marginTop: 8 }}>
            {filter === 'nærheten'
              ? 'Ingen flere i nærheten. Prøv "Alle" for å se flere.'
              : 'Kom tilbake senere – nye studenter dukker opp hele tiden!'}
          </p>
          {filter === 'nærheten'
            ? <button className="btn" style={{ marginTop: 20 }} onClick={() => setFilter('alle')}>Vis alle</button>
            : <button className="btn" style={{ marginTop: 20 }} onClick={() => {
                localStorage.removeItem(seenKey(user.uid))
                setDeck(SAMPLE_PROFILES.map(p => ({
                  ...p,
                  distance: userCoords && p.coords
                    ? getDistance(userCoords.lat, userCoords.lng, p.coords.lat, p.coords.lng)
                    : null,
                })))
              }}>Vis profilene på nytt</button>
          }
        </div>
      )}

      {matched && (
        <MatchOverlay
          me={profile}
          them={matched}
          onClose={() => setMatched(null)}
          onMessage={() => navigate(`/chat/${matched.id}`)}
        />
      )}
    </Layout>
  )
}

function Card({ profile, draggable, onDecision, myInterests }) {
  const ref   = useRef(null)
  const start = useRef(null)
  const [dragging,  setDragging]  = useState(false)
  const [photoIdx,  setPhotoIdx]  = useState(0)

  const photos = profile.photos?.length ? profile.photos : [profile.photo]

  function setTransform(dx, dy, animate = false) {
    const el = ref.current
    if (!el) return
    const rot = dx / 18
    el.style.transition = animate ? 'transform 0.3s ease' : 'none'
    el.style.transform  = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`
    const like = el.querySelector('.stamp.like')
    const nope = el.querySelector('.stamp.nope')
    if (like) like.style.opacity = Math.max(0, Math.min(1,  dx / SWIPE_THRESHOLD))
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
    const dx    = point.clientX - start.current.x
    const absDx = Math.abs(dx)
    const absDy = Math.abs(point.clientY - start.current.y)
    start.current = null
    setDragging(false)

    if (absDx > SWIPE_THRESHOLD) {
      setTransform(dx > 0 ? 600 : -600, 0, true)
      setTimeout(() => onDecision(dx > 0), 200)
    } else if (absDx < 8 && absDy < 8 && photos.length > 1) {
      setTransform(0, 0, true)
      const rect = ref.current?.getBoundingClientRect()
      if (rect) {
        const relX = point.clientX - rect.left
        if (relX < rect.width / 2) setPhotoIdx(i => Math.max(0, i - 1))
        else                        setPhotoIdx(i => Math.min(photos.length - 1, i + 1))
      }
    } else {
      setTransform(0, 0, true)
    }
  }

  useEffect(() => {
    if (!dragging) return
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend',  onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onUp)
    }
  }, [dragging])

  return (
    <div
      ref={ref}
      className="swipe-card"
      style={{ backgroundImage: `url(${photos[photoIdx]})` }}
      onMouseDown={onDown}
      onTouchStart={onDown}
    >
      <div className="stamp like">LIK</div>
      <div className="stamp nope">NEI</div>

      {photos.length > 1 && (
        <div className="photo-dots">
          {photos.map((_, i) => (
            <span key={i} className={`photo-dot${i === photoIdx ? ' active' : ''}`} />
          ))}
        </div>
      )}

      {/* Avstandsmerke */}
      {profile.distance !== null && profile.distance !== undefined && (
        <div className="distance-badge">
          <Navigation size={11} /> {formatDistance(profile.distance)}
        </div>
      )}

      <div className="overlay" />
      <div className="card-info">
        <h2>
          {profile.name} <span className="age">{profile.age}</span>
          {profile.verified && (
            <span className="verified"><ShieldCheck size={13} /> Verifisert</span>
          )}
        </h2>
        <div className="meta">
          <MapPin size={15} /> {profile.city}
          <span style={{ opacity: 0.6 }}>•</span>
          <GraduationCap size={15} /> {profile.study}
        </div>
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

function MatchOverlay({ me, them, onClose, onMessage }) {
  return (
    <div className="match-overlay">
      <div className="match-photos">
        <img src={me?.photo} alt="Deg" />
        <img src={them.photo} alt={them.name} />
      </div>
      <h2>Ny connection! 🎉</h2>
      <p>Du og {them.name} vil bli kjent.</p>
      <button className="btn" style={{ maxWidth: 280 }} onClick={onMessage}>Send en melding</button>
      <button className="btn btn-ghost" style={{ maxWidth: 280, marginTop: 10 }} onClick={onClose}>Fortsett å sveipe</button>
    </div>
  )
}

function overlap(a = [], b = []) {
  return a.filter(x => b.includes(x)).length
}
