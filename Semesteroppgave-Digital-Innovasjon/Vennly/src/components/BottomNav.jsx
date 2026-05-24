import { NavLink } from 'react-router-dom'
import { Flame, Heart, MessageCircle, CalendarDays, User } from 'lucide-react'

// Hovednavigasjon (informasjonsarkitektur). Konsistent på tvers av skjermene.
const items = [
  { to: '/swipe', label: 'Oppdag', Icon: Flame },
  { to: '/matches', label: 'Matcher', Icon: Heart },
  { to: '/chat', label: 'Meldinger', Icon: MessageCircle },
  { to: '/arrangementer', label: 'Skjer', Icon: CalendarDays },
  { to: '/profil', label: 'Profil', Icon: User },
]

export default function BottomNav() {
  return (
    <nav className="bottomnav">
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => 'navbtn' + (isActive ? ' active' : '')}
        >
          <Icon size={24} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}