import { ProductCard } from '@/components/atelier/product-card';
import { prisma } from '@/lib/db';

export async function NewArrivalsSection({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';

  // Read settings
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['newArrivals.enabled', 'newArrivals.heading_ar', 'newArrivals.heading_en', 'newArrivals.autoCount'] } },
  });
  const map = new Map(settings.map((s) => [s.key, s.value]));

  if (map.get('newArrivals.enabled') === '0') return null;

  const heading = isAr ? (map.get('newArrivals.heading_ar') || 'جديد الدار') : (map.get('newArrivals.heading_en') || 'Latest Arrivals');
  const autoCount = Number(map.get('newArrivals.autoCount')) || 8;

  // Manual featured picks first (in order), then auto-latest (excluding featured)
  const featured = await prisma.featuredProduct.findMany({
    orderBy: { order: 'asc' },
    include: { product: { include: { images: { take: 1 } } } },
  });
  const featuredIds = new Set(featured.map((f) => f.productId));

  const auto = await prisma.product.findMany({
    where: { active: true, id: { notIn: Array.from(featuredIds) } },
    orderBy: { createdAt: 'desc' },
    take: autoCount,
    include: { images: { take: 1 } },
  });

  const products = [
    ...featured.filter((f) => f.product.active).map((f) => f.product),
    ...auto,
  ].slice(0, Math.max(autoCount, featured.length));

  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <header className={`mb-12 md:mb-16 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3 inline-flex items-center gap-2" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            <span className="w-6 h-px bg-accent" />
            {isAr ? 'وصل حديثًا' : 'Just in'}
          </div>
          <h2 className="serif text-4xl md:text-5xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {heading}
          </h2>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
