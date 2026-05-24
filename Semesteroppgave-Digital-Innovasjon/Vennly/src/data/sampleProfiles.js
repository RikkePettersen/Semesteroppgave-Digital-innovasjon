// Eksempelprofiler til swipe-stokken. I en full løsning ville disse kommet
// fra Firestore, men her bruker vi statiske profiler så demoen alltid funker.
// Bildene er fra unsplash (gratis å bruke).

export const SAMPLE_PROFILES = [
  {
    id: 'p1', name: 'Emma', age: 21, city: 'Bergen',
    study: 'Sykepleie', year: '2. året',
    bio: 'Ny i Bergen og leter etter noen å gå på tur og ta kaffe med ☕️',
    interests: ['Friluftsliv', 'Kaffe', 'Trening', 'Musikk'],
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
    verified: true,
  },
  {
    id: 'p2', name: 'Mathias', age: 23, city: 'Trondheim',
    study: 'Informatikk', year: '4. året',
    bio: 'Koder på dagen, gamer på kvelden. Søker co-op buddy 🎮',
    interests: ['Gaming', 'Film & serier', 'Klatring'],
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
    verified: true,
  },
  {
    id: 'p3', name: 'Sofie', age: 20, city: 'Oslo',
    study: 'Psykologi', year: '1. året',
    bio: 'Elsker kunst, brettspill og lange kafébesøk. Ta kontakt! 🎨',
    interests: ['Kunst', 'Brettspill', 'Kaffe', 'Lesing'],
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80',
    verified: true,
  },
  {
    id: 'p4', name: 'Jonas', age: 24, city: 'Tromsø',
    study: 'Ingeniør', year: 'Master',
    bio: 'Friluftsmenneske som vil ha med folk på topptur og fjelltur 🏔️',
    interests: ['Friluftsliv', 'Foto', 'Trening', 'Reise'],
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    verified: false,
  },
  {
    id: 'p5', name: 'Amalie', age: 22, city: 'Stavanger',
    study: 'Markedsføring', year: '3. året',
    bio: 'Dansevenn søkes! Også glad i matlaging og gode serier 💃',
    interests: ['Dans', 'Matlaging', 'Film & serier', 'Musikk'],
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
    verified: true,
  },
  {
    id: 'p6', name: 'Henrik', age: 25, city: 'Oslo',
    study: 'Økonomi og administrasjon', year: 'Master',
    bio: 'Liker å spille fotball og henge på campus. Bli med på trening? ⚽️',
    interests: ['Fotball', 'Trening', 'Reise', 'Kaffe'],
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80',
    verified: true,
  },
]