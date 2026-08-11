import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import { products } from '../data/placeholders'

export default function Store() {
  return (
    <>
      <PageHeader
        eyebrow="Official store"
        title="Gear up."
        subtitle="Match-day apparel and desk goods, designed in the same navy and orange all three rosters compete in. New drops follow every split."
      />

      <section style={{ paddingBottom: '4rem' }}>
        <div className="shell">
          <div
            className="clip-sm"
            style={{
              marginBottom: '2rem',
              padding: '0.85rem 1.1rem',
              background: 'var(--tag-sky-bg)',
              border: '1px solid var(--tag-sky-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--color-sky-bright)',
            }}
          >
            Storefront preview — secure Stripe checkout is wired up in a later build phase.
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
