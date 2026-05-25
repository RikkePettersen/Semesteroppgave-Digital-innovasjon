import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CITIES, STUDY_PROGRAMS, INTERESTS, isStudentEmail } from '../data/options'

// Kombinert innlogging + registrering. Registrering går i to steg for å unngå
// å overvelde brukeren (reduserer kognitiv belastning – designprinsipp).
export default function Auth() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')   // 'login' | 'register'
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Felles felt
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Registreringsfelt
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [city, setCity] = useState(CITIES[0])
  const [study, setStudy] = useState(STUDY_PROGRAMS[0])
  const [interests, setInterests] = useState([])

  const studentEmail = isStudentEmail(email)

  function toggleInterest(i) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await login(email, password)
      navigate('/swipe')
    } catch (err) {
      setError(oversettFeil(err))
    } finally { setBusy(false) }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await register(email, password, {
        name, age: Number(age), city, study, interests,
        photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&q=80',
      })
      navigate('/swipe')
    } catch (err) {
      setError(oversettFeil(err))
    } finally { setBusy(false) }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">
        <img className="auth-logo-img" src="/vennly-logo.svg" alt="Vennly" />
        <p>Finn studievenner i din by</p>
      </div>

      <div className="auth-card">
        {/* ---------------- INNLOGGING ---------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>E-post</label>
              <input type="email" value={email} required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@student.no" />
            </div>
            <div className="field">
              <label>Passord</label>
              <input type="password" value={password} required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn" disabled={busy}>
              {busy ? 'Logger inn …' : 'Logg inn'}
            </button>
            <p className="auth-switch">
              Ny her?{' '}
              <button type="button" onClick={() => { setMode('register'); setStep(1); setError('') }}>
                Lag konto
              </button>
            </p>
          </form>
        )}

        {/* ---------------- REGISTRERING – STEG 1 ---------------- */}
        {mode === 'register' && step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setError(''); setStep(2) }}>
            <h3 style={{ marginBottom: 14, fontSize: '1.1rem' }}>Opprett konto</h3>

            <div className="field">
              <label>Student-e-post</label>
              <input type="email" value={email} required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ola@student.uio.no" />
              {email && (
                studentEmail
                  ? <p className="hint" style={{ color: '#1083d6', fontWeight: 600 }}>
                      <ShieldCheck size={13} style={{ verticalAlign: -2 }} /> Studentadresse gjenkjent – du blir verifisert ✔
                    </p>
                  : <p className="hint">Bruk gjerne studentmailen din (f.eks. @student.uio.no) for å bli verifisert.</p>
              )}
            </div>
            <div className="field">
              <label>Passord</label>
              <input type="password" value={password} required minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minst 6 tegn" />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn" disabled={!email || password.length < 6}>Neste</button>
            <p className="auth-switch">
              Har du konto?{' '}
              <button type="button" onClick={() => { setMode('login'); setError('') }}>Logg inn</button>
            </p>
          </form>
        )}

        {/* ---------------- REGISTRERING – STEG 2 ---------------- */}
        {mode === 'register' && step === 2 && (
          <form onSubmit={handleRegister}>
            <h3 style={{ marginBottom: 14, fontSize: '1.1rem' }}>Om deg</h3>

            <div className="field">
              <label>Fornavn</label>
              <input value={name} required onChange={(e) => setName(e.target.value)} placeholder="Ola" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Alder</label>
                <input type="number" min={16} max={100} value={age} required
                  onChange={(e) => setAge(e.target.value)} placeholder="21" />
              </div>
              <div className="field" style={{ flex: 2 }}>
                <label>By / studiested</label>
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Studieprogram</label>
              <select value={study} onChange={(e) => setStudy(e.target.value)}>
                {STUDY_PROGRAMS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Interesser (velg minst 3)</label>
              <div className="chips">
                {INTERESTS.map((i) => (
                  <button type="button" key={i}
                    className={'chip' + (interests.includes(i) ? ' selected' : '')}
                    onClick={() => toggleInterest(i)}>
                    {interests.includes(i) && <Check size={13} style={{ verticalAlign: -2, marginRight: 3 }} />}
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="error">{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }}
                onClick={() => setStep(1)}>Tilbake</button>
              <button className="btn" style={{ flex: 2 }}
                disabled={busy || !name || !age || interests.length < 3}>
                {busy ? 'Oppretter …' : 'Kom i gang'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function oversettFeil(err) {
  const code = err?.code || ''
  if (code.includes('email-already-in-use')) return 'E-posten er allerede i bruk.'
  if (code.includes('invalid-email'))        return 'Ugyldig e-postadresse.'
  if (code.includes('weak-password'))        return 'Passordet er for svakt (minst 6 tegn).'
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential'))
    return 'Feil e-post eller passord. Hvis du registrerte deg i demo-modus (uten Firebase) må du opprette ny konto.'
  if (code.includes('network-request-failed')) return 'Nettverksfeil – sjekk internettforbindelsen.'
  if (code.includes('too-many-requests'))      return 'For mange forsøk. Vent litt og prøv igjen.'
  return err?.message || 'Noe gikk galt. Prøv igjen.'
}