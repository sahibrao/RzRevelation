import type { Announcement } from '../data/placeholders'

export default function AnnouncementCard({ post }: { post: Announcement }) {
  return (
    <article className="panel clip" style={{ padding: '1.4rem 1.5rem' }}>
      <span className="bracket" />
      <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
        <span className="tag-orange tag">{post.category}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-mute)' }}>
          {post.date}
        </span>
      </div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>{post.title}</h3>
      <p style={{ color: 'var(--color-fog)', opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }}>
        {post.excerpt}
      </p>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-mute)' }}>
          by {post.author}
        </span>
        <span style={{ color: 'var(--color-sky-bright)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
          Read →
        </span>
      </div>
    </article>
  )
}
