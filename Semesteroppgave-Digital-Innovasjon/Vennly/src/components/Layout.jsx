import { useState } from 'react'
import { MailCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BottomNav from './BottomNav'

export default function Layout({ title, children, action }) {
  const { user, isFirebaseConfigured, resendVerificationEmail } = useAuth()
  const [sent, setSent] = useState(false)

  const showVerifyBanner = isFirebaseConfigured && user && !user.emailVerified

  async function handleResend() {
    await resendVerificationEmail()
    setSent(true)
  }

  return (
    <div className="phone">
      <BottomNav />
      <div className="content-area">
        {!isFirebaseConfigured && (
          <div className="demo-banner">
            Demo-modus – Firebase er ikke koblet til ennå. Data lagres kun lokalt i nettleseren.
          </div>
        )}
        {showVerifyBanner && (
          <div className="verify-banner">
            <MailCheck size={15} />
            <span>Bekreft e-posten din for å aktivere kontoen.</span>
            {sent
              ? <span className="verify-sent">Sendt!</span>
              : <button className="verify-resend" onClick={handleResend}>Send på nytt</button>
            }
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
