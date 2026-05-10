import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
import { BottomNav } from '@/components/atelier/bottomnav';
import { Editorial } from '@/components/atelier/editorial';
import { ProductCard } from '@/components/atelier/product-card';
import { Link } from '@/i18n/routing';

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('home');
  const isAr = locale === 'ar';

  const products = await prisma.product.findMany({
    where: { active: true },
    include: { images: { take: 1, orderBy: { order: 'asc' } } },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    take: 8,
  });
  const curated = products.slice(0, 2);
  const second = products.slice(2, 4);

  return (
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body has-bottomnav">
        {/* Hero */}
        <div className="relative">
          <TopBar transparent />
          <Editorial variant="v5" ratio="2/3" fade>
            <div className={`absolute bottom-6 left-0 right-0 px-6 text-pearl ${isAr ? 'text-right' : 'text-left'} z-[4]`}>
              <div className="text-[10px] tracking-[0.3em] text-bone uppercase" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>{t('eyebrow')}</div>
              <h1 className="serif text-5xl leading-[0.95] font-light mt-3" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.03em' }}>
                {t('heroTitle1')}<br />
                <em className={isAr ? '' : 'italic'} style={{ color: 'var(--accent)', fontStyle: isAr ? 'normal' : 'italic' }}>{t('heroTitle2')}</em>
              </h1>
              <p className="text-xs text-bone mt-3 opacity-85">{t('heroSub')}</p>
              <Link href={'/collections' as any} className="inline-block mt-5 text-[11px] tracking-[0.16em] uppercase border-b border-[var(--accent)] pb-1 text-pearl" style={isAr ? { letterSpacing: 0, textTransform: 'none', fontFamily: 'var(--sans-ar)' } : {}}>
                {t('viewCollection')} →
              </Link>
            </div>
          </Editorial>
        </div>

        {/* Curated */}
        <section className="px-6 pt-12 pb-6">
          <div className={`flex justify-between items-baseline mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={isAr ? 'text-right' : ''}>
              <div className="t-eyebrow">{t('curatedSub')}</div>
              <h2 className="serif text-3xl font-normal mt-1" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('curatedEye')}</h2>
            </div>
            <Link href={'/collections' as any} className="text-fg-secondary text-xl">{isAr ? '←' : '→'}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {curated.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>

        {/* Quote */}
        <section className={`px-8 py-12 bg-bg-elevated border-y border-border ${isAr ? 'text-right' : 'text-left'}`}>
          <p className="serif text-2xl leading-[1.4] font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { fontStyle: 'italic' }}>
            {t('quote')}
          </p>
          <div className="t-eyebrow mt-6">{t('quoteAttr')}</div>
        </section>

        {/* Lookbook */}
        <section className="py-12">
          <Editorial variant="v8" ratio="3/4" fade>
            <div className={`absolute bottom-6 left-0 right-0 px-6 text-pearl z-[4] ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="text-[10px] tracking-[0.3em] text-bone uppercase" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>{t('lookbookEye')}</div>
              <h3 className="serif text-4xl leading-none font-light mt-2" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>{t('lookbookTitle')}</h3>
            </div>
          </Editorial>
        </section>

        {/* Second row */}
        <section className="px-6 pb-12">
          <div className="grid grid-cols-2 gap-3">
            {second.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>

        {/* Bespoke CTA */}
        <section className="mx-6 mb-12 py-12 px-8 text-onyx" style={{ background: 'var(--accent)' }}>
          <div className={isAr ? 'text-right' : 'text-left'}>
            <div className="text-[11px] tracking-[0.3em] uppercase opacity-70" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>{t('bespokeEye')}</div>
            <h3 className="serif text-3xl leading-tight font-normal mt-3 mb-6" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.01em' }}>
              {t('bespokeTitle')}
            </h3>
            <Link href={'/bespoke' as any} className="inline-flex items-center justify-center bg-onyx text-pearl px-6 h-12 text-[11px] tracking-[0.16em] uppercase" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {t('bespokeCta')}
            </Link>
          </div>
        </section>

        <footer className="px-6 pt-6 pb-12 text-center text-[10px] tracking-[0.2em] text-fg-tertiary uppercase" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          {t('footerNote')}
        </footer>
      </div>
      <BottomNav />
    </div>
  );
}
