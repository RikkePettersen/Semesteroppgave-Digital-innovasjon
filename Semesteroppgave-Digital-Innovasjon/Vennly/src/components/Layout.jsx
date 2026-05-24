import { useAuth } from '../context/AuthContext'
import BottomNav from './BottomNav'

// Felles ramme rundt de innloggede skjermene: topplinje + innhold + bunnmeny.
export default function Layout({ title, children, action }) {
  const { isFirebaseConfigured } = useAuth()
  return (
    <div className="phone">
      {!isFirebaseConfigured && (
        <div className="demo-banner">
          Demo-modus – Firebase er ikke koblet til ennå. Data lagres kun lokalt i nettleseren.
        </div>
      )}
      <header className="topbar">
        <div className="logo">
          <img src="/vennly-mark.svg" alt="Vennly" />
          <span className="brand">{title || 'Vennly'}</span>
        </div>
        {action}
      </header>
      <main className="screen">{children}</main>
      <BottomNav />
    </div>
  )
}