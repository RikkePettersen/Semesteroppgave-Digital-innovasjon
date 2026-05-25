import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Auth from './pages/Auth'
import Swipe from './pages/Swipe'
import Matches from './pages/Matches'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Placeholder from './pages/Placeholder'
import Events from './pages/Events'
import Chat from './pages/Chat'

// Beskytter ruter som krever innlogging.
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner-wrap">Vennly …</div>
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user, loading, profile } = useAuth()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!profile?.darkMode)
  }, [profile?.darkMode])

  if (loading) return <div className="spinner-wrap">Vennly …</div>

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/swipe" replace /> : <Auth />} />

      <Route path="/swipe" element={<Protected><Swipe /></Protected>} />
      <Route path="/matches" element={<Protected><Matches /></Protected>} />
      <Route path="/profil" element={<Protected><Profile /></Protected>} />
      <Route path="/innstillinger" element={<Protected><Settings /></Protected>} />

      <Route path="/chat"          element={<Protected><Chat /></Protected>} />
      <Route path="/chat/:matchId" element={<Protected><Chat /></Protected>} />
      <Route path="/arrangementer" element={<Protected><Events /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}