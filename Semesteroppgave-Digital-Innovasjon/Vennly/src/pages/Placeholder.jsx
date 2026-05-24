import Layout from '../components/Layout'

// Enkel "kommer snart"-skjerm for funksjoner som er skissert i konseptet,
// men ikke ferdig utviklet i denne iterasjonen (chat/icebreakers, arrangementer).
export default function Placeholder({ title, text, Icon }) {
  return (
    <Layout title={title}>
      <div className="empty" style={{ marginTop: 40 }}>
        {Icon && <Icon size={48} style={{ marginBottom: 14, opacity: 0.35 }} />}
        <h3>{title}</h3>
        <p style={{ marginTop: 8 }}>{text}</p>
      </div>
    </Layout>
  )
}