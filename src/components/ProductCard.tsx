import type { Product } from '../data/placeholders'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="panel clip">
      <span className="bracket" />
      <div className={`swatch swatch-${product.accent}`}>
        <span className="swatch-mark">Rz</span>
        <span style={{ position: 'absolute', top: 10, left: 10 }}>
          <span className={product.accent === 'orange' ? 'tag tag-orange' : 'tag'}>{product.category}</span>
        </span>
      </div>
      <div style={{ padding: '1.1rem 1.15rem 1.3rem' }}>
        <div className="flex items-start justify-between gap-3">
          <h3 style={{ fontSize: '1.2rem', lineHeight: 1.15 }}>{product.name}</h3>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.2rem',
              color: 'var(--color-orange-bright)',
              whiteSpace: 'nowrap',
            }}
          >
            ${product.price}
          </span>
        </div>
        <p style={{ color: 'var(--color-mute)', fontSize: '0.9rem', lineHeight: 1.55, margin: '0.6rem 0 1rem' }}>
          {product.blurb}
        </p>
        <button className="btn btn-ghost btn-block" type="button" disabled title="Checkout arrives in a later phase">
          Add to cart
        </button>
      </div>
    </article>
  )
}
