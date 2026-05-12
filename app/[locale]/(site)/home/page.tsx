import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { Editorial } from '@/components/atelier/editorial';
import { ProductCard } from '@/components/atelier/product-card';
import { NotesSection } from '@/components/atelier/notes-section';
import { StylistSection } from '@/components/atelier/stylist-section';
import { HeroSlider } from '@/components/atelier/hero-slider';
import { NewArrivalsSection } from '@/components/atelier/new-arrivals-section';
import { CategoriesSection } from '@/components/atelier/categories-section';
import { Link } from '@/i18n/routing';
import { getCustomer } from '@/lib/auth';
import { getStylistRecommendations } from '@/lib/stylist';

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('home');
  const isAr = locale === 'ar';

  const me = await getCustomer();

  // Sequential queries (pooler is connection_limit=1)
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { images: { take: 1, orderBy: { order: 'asc' } } },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    take: 12,
  });
  const notes = await prisma.atelierNote.findMany({ where: { active: true }, orderBy: { number: 'desc' }, take: 5 });
  const recs = me ? await getStylistRecommendations(me.id, 4) : [] as any[];
  const heroSlides = await prisma.heroSlide.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });

  const curated = products.slice(0, 4);
  const second = products.slice(4, 8);
  const customer = me ? await prisma.customer.findUnique({ where: { id: me.id }, select: { name: true } }) : null;

  return (
    <div>
      {/* Hero Slider — admin-managed (above the static hero) */}
      {heroSlides.length > 0 && (
        <HeroSlider slides={heroSlides} locale={isAr ? 'ar' : 'en'} />
      )}

      {/* Categories grid — auto-pulls from active Category rows */}
      <CategoriesSection locale={isAr ? 'ar' : 'en'} />

      {/* New Arrivals — auto + manual featured */}
      <NewArrivalsSection locale={isAr ? 'ar' : 'en'} />

      {/* Hero — full viewport */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        <Editorial variant="v5" ratio="auto" className="absolute inset-0" fade>
          <div className="absolute inset-0 max-w-[1500px] mx-auto px-6 md:px-12 lg:px-16 flex items-end pb-16 md:pb-24 lg:pb-32">
            <div className={`text-pearl max-w-2xl ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-bone mb-4 md:mb-6" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                {t('eyebrow')}
              </div>
              <h1 className="serif font-light leading-[0.95]" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.03em' }}>
                <span className="block text-6xl md:text-8xl lg:text-9xl">{t('heroTitle1')}</span>
                <em className="block text-7xl md:text-9xl lg:text-[10rem]" style={{ color: 'var(--accent)', fontStyle: isAr ? 'normal' : 'italic', fontWeight: 400 }}>
                  {t('heroTitle2')}
                </em>
              </h1>
              <p className="text-bone text-base md:text-lg mt-6 md:mt-8 opacity-85">{t('heroSub')}</p>
              <Link href={'/collections' as any} className="inline-block mt-8 md:mt-10 text-[11px] md:text-xs tracking-[0.2em] uppercase border-b border-accent pb-1.5 text-pearl hover:border-pearl transition-colors" data-sound="hover" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                {t('viewCollection')} →
              </Link>
            </div>
          </div>
        </Editorial>
      </section>

      {/* Personal Stylist (only for logged-in customers with prefs/history) */}
      {recs.length > 0 && <StylistSection products={recs} customerName={customer?.name} />}

      {/* Curated picks */}
      <section className="container-x py-20 md:py-32">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-2" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {t('curatedSub')}
            </div>
            <h2 className="serif text-3xl md:text-5xl lg:text-6xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
              {t('curatedEye')}
            </h2>
          </div>
          <Link href={'/collections' as any} className="hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-fg-tertiary hover:text-fg border-b border-border hover:border-fg pb-1.5" data-sound="hover" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {isAr ? 'الكل' : 'View all'} →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {curated.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Atelier Notes — editorial journal */}
      <NotesSection notes={notes} />

      {/* Lookbook */}
      <section className="container-x py-20 md:py-32">
        <Editorial variant="v8" ratio="16/9" fade>
          <div className={`absolute bottom-8 md:bottom-16 left-0 right-0 px-8 md:px-16 text-pearl z-[4] ${isAr ? 'text-right' : 'text-left'}`}>
            <div className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-bone mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {t('lookbookEye')}
            </div>
            <h3 className="serif text-5xl md:text-7xl lg:text-8xl font-light leading-none" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
              {t('lookbookTitle')}
            </h3>
          </div>
        </Editorial>
      </section>

      {/* Second products row */}
      <section className="container-x pb-20 md:pb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {second.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Bespoke CTA */}
      <section className="relative" style={{ background: 'var(--accent)', color: 'var(--onyx)' }}>
        <div className="container-x py-20 md:py-32 lg:py-40 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className={isAr ? 'text-right' : 'text-left'}>
            <div className="text-[11px] tracking-[0.3em] uppercase opacity-70 mb-4" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {t('bespokeEye')}
            </div>
            <h3 className="serif text-4xl md:text-6xl lg:text-7xl font-light leading-tight" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
              {t('bespokeTitle')}
            </h3>
          </div>
          <div className={`flex ${isAr ? 'md:justify-start' : 'md:justify-end'}`}>
            <Link href={'/bespoke' as any} className="inline-flex items-center justify-center bg-onyx text-pearl px-10 py-5 text-[11px] tracking-[0.2em] uppercase hover:bg-ash transition-colors" data-sound="hover" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {t('bespokeCta')} →
            </Link>
          </div>
        </div>
      </section>

      <section className="container-x py-16 text-center text-[10px] tracking-[0.3em] uppercase text-fg-tertiary num" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
        {t('footerNote')}
      </section>
    </div>
  );
}
