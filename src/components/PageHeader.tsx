type Props = {
  eyebrow: string
  title: string
  subtitle?: string
}

export default function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <header className="section" style={{ paddingBottom: '1.5rem' }}>
      <div className="shell">
        <p className="eyebrow rise">{eyebrow}</p>
        <h1 className="rise rise-1" style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', marginTop: '1rem' }}>
          {title}
        </h1>
        {subtitle && (
          <p
            className="rise rise-2"
            style={{ color: 'var(--color-mute)', maxWidth: '60ch', marginTop: '1rem', fontSize: '1.05rem', lineHeight: 1.6 }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </header>
  )
}
