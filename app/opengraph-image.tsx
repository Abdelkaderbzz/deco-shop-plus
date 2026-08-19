import { ImageResponse } from 'next/og'
import { SITE } from '@/lib/site'

export const alt = `${SITE.name} — ${SITE.tagline} a ${SITE.city}`
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
          background: 'linear-gradient(160deg, #0d1514 0%, #14201e 55%, #0f5c64 100%)',
          fontFamily: 'Georgia, Times New Roman, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 64px',
            borderRadius: 32,
            border: '1px solid rgba(94, 179, 184, 0.35)',
            background: 'rgba(20, 32, 30, 0.75)',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#5eb3b8',
              marginBottom: 18,
            }}
          >
            {SITE.neighborhood}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: '#e8efea',
              lineHeight: 1.1,
            }}
          >
            Deco Shop Plus
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 22,
              fontSize: 22,
              letterSpacing: '0.08em',
              color: '#9bb0ab',
            }}
          >
            Coussins · Accessoires · Rangement · Literie
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 20,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#3d9aa0',
            }}
          >
            {`${SITE.city}, Tunisie · ${SITE.phoneDisplay}`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
