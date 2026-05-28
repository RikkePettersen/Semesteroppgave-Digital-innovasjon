// ---------------------------------------------------------------------------
// Firebase-oppsett for Vennly
// ---------------------------------------------------------------------------
// 1. Gå til https://console.firebase.google.com og opprett et prosjekt.
// 2. Legg til en "Web app" (</>-ikonet) og kopier firebaseConfig-objektet.
// 3. Lim verdiene inn under (eller bruk en .env-fil – se README_OPPSETT.md).
// 4. Aktiver Authentication > Sign-in method > Email/Password.
// 5. Opprett en Firestore-database (start i testmodus mens dere utvikler).
// ---------------------------------------------------------------------------

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Leser fra .env hvis den finnes, ellers fra plassholderne under.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'DIN_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'DITT_PROSJEKT.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'DITT_PROSJEKT',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'DITT_PROSJEKT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'DIN_SENDER_ID',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || 'DIN_APP_ID',
}

// Sjekker om appen er konfigurert, slik at vi kan vise en hjelpsom melding
// i stedet for en kryptisk feil hvis nøklene mangler.
export const isFirebaseConfigured = firebaseConfig.apiKey !== 'DIN_API_KEY'

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app