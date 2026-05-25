// Haversine – avstand mellom to koordinater i km
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function toRad(deg) { return deg * (Math.PI / 180) }

export function formatDistance(km) {
  if (km < 1)    return '< 1 km'
  if (km >= 100) return `${km} km`
  return `${km} km`
}

// Ber om GPS-posisjon fra nettleseren
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolokasjon støttes ikke av nettleseren.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => {
        if (err.code === 1) reject(new Error('Tillatelse nektet. Sjekk nettleserinnstillingene.'))
        else                reject(new Error('Kunne ikke hente posisjon. Prøv igjen.'))
      },
      { timeout: 10000, maximumAge: 300000 },
    )
  })
}

// Unøyaktiggjør koordinater til ~1 km nøyaktighet (2 desimaler)
// før de lagres – slik at eksakt posisjon aldri havner i databasen.
export function fuzzyCoords(lat, lng) {
  return {
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100,
  }
}

// Omtrentlig stedsnavn fra koordinater (bruker Nominatim)
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=no`,
      { headers: { 'Accept-Language': 'no' } },
    )
    const data = await res.json()
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'Ukjent sted'
    )
  } catch {
    return null
  }
}
