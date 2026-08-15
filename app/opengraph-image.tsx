import { ImageResponse } from 'next/og'

export const alt = 'Water of Cold Parfume — Beaute feminine'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(160deg, #fef8f6 0%, #f5e6e0 55%, #edd5cc 100%)',
          fontFamily: 'Georgia, Times New Roman, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 64px',
            border: '1px solid rgba(168, 112, 98, 0.28)',
            background: 'rgba(255,255,255,0.55)',
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: '#a87062',
              marginBottom: 18,
            }}
          >
            Water of Cold Parfume
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 300,
              letterSpacing: '0.08em',
              color: '#3a2a26',
              lineHeight: 1.1,
            }}
          >
            Beaute feminine
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 22,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#7a5a52',
            }}
          >
            Parfums · Maquillage · Sacs · Soins
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 20,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#a87062',
            }}
          >
            Tunisie
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
