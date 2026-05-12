import { Link } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { Crest } from './crest';

export async function CategoriesSection({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: { _count: { select: { products: true } } },
  });

  if (categories.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-bg-elevated/30 relative reveal-on-scroll scroll-glow-y">
      <div className="container-x">
        <header className={`mb-12 md:mb-16 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3 inline-flex items-center gap-2" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            <span className="w-6 h-px bg-accent" />
            {isAr ? 'استكشف' : 'Explore'}
          </div>
          <h2 className="serif text-4xl md:text-5xl lg:text-6xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {isAr ? 'أقسام الدار' : 'The House'}
          </h2>
          <p className="ed-caption text-fg-secondary mt-4 max-w-xl">
            {isAr
              ? 'تصفّح المجموعات حسب التخصّص — كل قسم له قصته وحرفته.'
              : 'Browse by craft — every category, a story of its own.'}
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} isAr={isAr} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category, isAr }: { category: any; isAr: boolean }) {
  const name = isAr ? category.nameAr : category.nameEn;
  const count = category._count?.products || 0;
  return (
    <Link
      href={`/collections?cat=${category.slug}` as any}
      className="group block relative overflow-hidden bg-bg border border-border hover:border-accent transition-colors aspect-[3/4]"
    >
      {category.image ? (
        <img
          src={category.image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-fg-tertiary/40">
          <Crest size={56} />
        </div>
      )}

      {/* Bottom gradient + label */}
      <div className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-onyx/30 to-transparent" />

      <div className={`absolute inset-x-0 bottom-0 p-5 md:p-6 text-pearl ${isAr ? 'text-right' : 'text-left'}`}>
        <div className="text-[9px] tracking-[0.3em] uppercase text-pearl/60 mb-1.5 num" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          {count > 0 ? (isAr ? `${count} قطعة` : `${count} pieces`) : (isAr ? 'قريبًا' : 'Coming soon')}
        </div>
        <h3 className="serif text-2xl md:text-3xl font-light leading-tight" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.01em' }}>
          {name}
        </h3>
        <div className="h-px w-8 bg-accent mt-3 transition-all duration-500 group-hover:w-16" />
      </div>
    </Link>
  );
}
