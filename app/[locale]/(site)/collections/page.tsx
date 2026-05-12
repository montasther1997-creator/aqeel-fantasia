import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { Editorial } from '@/components/atelier/editorial';
import { ProductCard } from '@/components/atelier/product-card';
import { EditorialMixGrid } from '@/components/atelier/editorial-grid';

export const revalidate = 60;

export default async function CollectionsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ cat?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations('collections');
  const isAr = locale === 'ar';

  // Sequential — pool=1
  const products = await prisma.product.findMany({
    where: { active: true, ...(sp.cat ? { category: { slug: sp.cat } } : {}) },
    include: { images: { take: 1, orderBy: { order: 'asc' } } },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }],
  });
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { order: 'asc' } });

  return (
    <div className="pt-20 md:pt-32 pb-20">
      {/* Header */}
      <section className="container-x mb-16 md:mb-20">
        <div className={`max-w-3xl ${isAr ? 'md:mr-auto md:ml-0' : ''}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-4" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {t('eyebrow')}
          </div>
          <h1 className="serif text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95]" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.03em' }}>
            {t('title')}
          </h1>
          <p className="serif italic text-lg md:text-xl text-fg-secondary mt-6 font-light max-w-xl" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
            {t('sub')}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container-x mb-12">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <a href="/collections" className={`shrink-0 px-5 py-2.5 text-[10px] md:text-xs tracking-[0.2em] uppercase border transition-colors ${!sp.cat ? 'border-fg text-fg bg-fg/5' : 'border-border text-fg-tertiary hover:border-fg hover:text-fg'}`} style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {t('all')}
          </a>
          {categories.map((c) => (
            <a key={c.id} href={`/collections?cat=${c.slug}`} className={`shrink-0 px-5 py-2.5 text-[10px] md:text-xs tracking-[0.2em] uppercase border whitespace-nowrap transition-colors ${sp.cat === c.slug ? 'border-fg text-fg bg-fg/5' : 'border-border text-fg-tertiary hover:border-fg hover:text-fg'}`} style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {isAr ? c.nameAr : c.nameEn}
            </a>
          ))}
        </div>
      </section>

      {/* Featured editorial */}
      <section className="container-x mb-16 md:mb-20">
        <Editorial variant="v3" ratio="21/9" fade>
          <div className={`absolute bottom-8 md:bottom-12 left-0 right-0 px-8 md:px-16 text-pearl z-[4] ${isAr ? 'text-right' : 'text-left'}`}>
            <div className="text-[10px] tracking-[0.3em] uppercase text-bone mb-2" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {t('featuredEye')}
            </div>
            <h3 className="serif text-4xl md:text-6xl lg:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
              {t('featuredTitle')}
            </h3>
            <div className="text-xs text-bone mt-3 num">
              <span className="num">{products.length}</span> {t('featuredMeta')}
            </div>
          </div>
        </Editorial>
      </section>

      {/* Editorial Mix Grid (Vogue layout) */}
      <section className="container-x">
        <EditorialMixGrid products={products} />
      </section>
    </div>
  );
}
