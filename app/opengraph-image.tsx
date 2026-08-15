import { ImageResponse } from 'next/og'

export const alt = 'Water of Gold — Parfumerie a Sousse'
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
          background: 'linear-gradient(160deg, #0b0b0b 0%, #1a1712 55%, #2a2418 100%)',
          fontFamily: 'Georgia, Times New Roman, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 64px',
            border: '1px solid rgba(201, 164, 74, 0.35)',
            background: 'rgba(20, 18, 16, 0.7)',
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: '#c9a44a',
              marginBottom: 18,
            }}
          >
            Water of Gold
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 300,
              letterSpacing: '0.08em',
              color: '#f3e6c4',
              lineHeight: 1.1,
            }}
          >
            Parfumerie
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 22,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#b8a88a',
            }}
          >
            Femme · Homme · Longue tenue
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 20,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#c9a44a',
            }}
          >
            Sousse, Tunisie
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
