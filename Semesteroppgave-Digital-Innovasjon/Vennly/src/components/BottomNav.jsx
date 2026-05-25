import { NavLink } from 'react-router-dom'
import { Handshake, Heart, MessageCircle, CalendarDays, User } from 'lucide-react'

const items = [
  { to: '/swipe',         label: 'Oppdag',    Icon: Handshake },
  { to: '/matches',       label: 'Venner',    Icon: Heart },
  { to: '/chat',          label: 'Meldinger', Icon: MessageCircle },
  { to: '/arrangementer', label: 'Skjer',     Icon: CalendarDays },
  { to: '/profil',        label: 'Profil',    Icon: User },
]

export default function BottomNav() {
  return (
    <nav className="bottomnav">
      <div className="sidenav-brand">
        <img src="/vennly-mark.svg" alt="Vennly" />
        <span>vennly</span>
      </div>
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => 'navbtn' + (isActive ? ' active' : '')}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
