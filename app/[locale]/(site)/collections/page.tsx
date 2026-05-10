import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
import { BottomNav } from '@/components/atelier/bottomnav';
import { Editorial } from '@/components/atelier/editorial';
import { ProductCard } from '@/components/atelier/product-card';

export const revalidate = 60;

export default async function CollectionsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ cat?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations('collections');
  const isAr = locale === 'ar';

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, ...(sp.cat ? { category: { slug: sp.cat } } : {}) },
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    }),
    prisma.category.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ]);

  return (
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body has-bottomnav">
        <TopBar />
        <header className={`px-6 pt-12 pb-8 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="t-eyebrow">{t('eyebrow')}</div>
          <h1 className="serif text-5xl font-light leading-[0.95] mt-3" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.03em' }}>{t('title')}</h1>
          <p className="serif text-base text-fg-secondary mt-4 italic font-light" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>{t('sub')}</p>
        </header>

        {/* Filters */}
        <div className="px-6 mb-6 flex gap-2 overflow-x-auto no-scrollbar">
          <a href="/collections" className={`shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border ${!sp.cat ? 'border-fg text-fg' : 'border-border text-fg-tertiary'}`} style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {t('all')}
          </a>
          {categories.map((c) => (
            <a key={c.id} href={`/collections?cat=${c.slug}`} className={`shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border whitespace-nowrap ${sp.cat === c.slug ? 'border-fg text-fg' : 'border-border text-fg-tertiary'}`} style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {isAr ? c.nameAr : c.nameEn}
            </a>
          ))}
        </div>

        {/* Featured editorial */}
        <section className="mx-6 mb-8">
          <Editorial variant="v3" ratio="4/3" fade>
            <div className={`absolute bottom-4 left-0 right-0 px-5 text-pearl z-[4] ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="text-[9px] tracking-[0.3em] text-bone uppercase" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>{t('featuredEye')}</div>
              <h3 className="serif text-3xl font-light leading-none mt-1" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('featuredTitle')}</h3>
              <div className="text-[10px] text-bone mt-2 num"><span className="num">{products.length}</span> {t('featuredMeta')}</div>
            </div>
          </Editorial>
        </section>

        {/* Grid */}
        <section className="px-6 pb-12">
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
