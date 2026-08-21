export function OgShareCard({
  eyebrow,
  title,
  footer,
  imageSrc,
}: {
  eyebrow: string
  title: string
  footer: string
  imageSrc?: string | null
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: 'linear-gradient(160deg, #0d1514 0%, #14201e 55%, #0f5c64 100%)',
        fontFamily: 'Georgia, Times New Roman, serif',
        color: '#e8efea',
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          width={630}
          height={630}
          style={{
            width: 630,
            height: 630,
            objectFit: 'cover',
          }}
        />
      ) : null}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          padding: imageSrc ? '48px 56px' : '48px 64px',
          alignItems: imageSrc ? 'flex-start' : 'center',
          textAlign: imageSrc ? 'left' : 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#5eb3b8',
            marginBottom: 18,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: imageSrc ? 48 : 64,
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.12,
            maxWidth: 560,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 22,
            fontSize: 20,
            letterSpacing: '0.08em',
            color: '#9bb0ab',
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  )
}
