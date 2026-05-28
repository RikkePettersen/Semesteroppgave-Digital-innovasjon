// Felles valglister som brukes i registrering, profil og filter.

export const CITIES = [
  'Oslo', 'Bergen', 'Trondheim', 'Tromsø', 'Stavanger',
  'Kristiansand', 'Bodø', 'Ålesund', 'Drammen', 'Lillehammer','Vadsø',
]

export const STUDY_PROGRAMS = [
  'Informatikk', 'Sykepleie', 'Økonomi og administrasjon', 'Jus',
  'Psykologi', 'Lærerutdanning', 'Ingeniør', 'Medisin',
  'Markedsføring', 'Design', 'Statsvitenskap', 'Biologi',
  'Annet', 'Idrettsfag',
]

export const INTERESTS = [
  'Trening', 'Gaming', 'Musikk', 'Film & serier', 'Friluftsliv',
  'Matlaging', 'Kaffe', 'Reise', 'Lesing', 'Foto', 'Dans',
  'Fotball', 'Klatring', 'Kunst', 'Frivillighet', 'Brettspill',
]

// Norske student-/universitets-domener brukt til "verifisert student"-merket.
// Lista kan utvides – dette er en enkel heuristikk for prototypen.
export const STUDENT_DOMAINS = [
  'uio.no', 'student.uio.no',
  'ntnu.no', 'stud.ntnu.no',
  'uib.no', 'student.uib.no',
  'uit.no', 'post.uit.no',
  'uia.no', 'student.uia.no',
  'oslomet.no', 'student.oslomet.no',
  'nmbu.no', 'student.nmbu.no',
  'nord.no', 'student.nord.no',
  'usn.no', 'student.usn.no',
  'hvl.no', 'student.hvl.no',
  'bi.no', 'student.bi.no',
  'feide.no',
]

export function isStudentEmail(email) {
  if (!email || !email.includes('@')) return false
  const domain = email.split('@')[1].toLowerCase().trim()
  return STUDENT_DOMAINS.some((d) => domain === d || domain.endsWith('.' + d))
}