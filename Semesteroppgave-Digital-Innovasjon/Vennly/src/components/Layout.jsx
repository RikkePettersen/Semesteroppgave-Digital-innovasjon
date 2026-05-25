import { useAuth } from '../context/AuthContext'
import BottomNav from './BottomNav'

export default function Layout({ title, children, action }) {
  const { isFirebaseConfigured } = useAuth()
  return (
    <div className="phone">
      <BottomNav />
      <div className="content-area">
        {!isFirebaseConfigured && (
          <div className="demo-banner">
            Demo-modus – Firebase er ikke koblet til ennå. Data lagres kun lokalt i nettleseren.
          </div>
        )}
        <header className="topbar">
          <div className="logo">
            <img src="/vennly-mark.svg" alt="Vennly" className="topbar-logo-img" />
            <span className="brand">{title || 'Vennly'}</span>
          </div>
          {action}
        </header>
        <main className="screen">{children}</main>
      </div>
    </div>
  )
}
