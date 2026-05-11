import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { Editorial } from '@/components/atelier/editorial';
import { Link } from '@/i18n/routing';
import { fmtNumber } from '@/lib/utils';

export default async function MadeForMePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const me = await getCustomer();
  if (!me) redirect({ href: '/auth', locale });

  const pieces = await prisma.madeForOne.findMany({
    where: { customerId: me!.id },
    include: { product: { include: { images: { orderBy: { order: 'asc' } } } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x">
        <header className={`mb-12 md:mb-20 max-w-3xl ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-accent mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {isAr ? '✦ صُنع لك' : '✦ MADE FOR ONE'}
          </div>
          <h1 className="serif text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95]" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.03em' }}>
            {isAr ? 'قطعٌ صُنعت لك وحدك.' : 'Pieces made for you alone.'}
          </h1>
          <p className="serif italic text-lg md:text-xl text-fg-secondary mt-6 font-light" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
            {isAr ? 'قطعة واحدة في العالم — لشخص واحد. أنت.' : 'One piece in the world — for one person. You.'}
          </p>
        </header>

        {pieces.length === 0 ? (
          <div className="py-20 text-center">
            <p className="serif italic text-fg-secondary text-xl font-light max-w-md mx-auto" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
              {isAr ? 'لم تُخصَّص لك قطعة بعد. كن من الذين يطلبون التفصيل، وسنخصِّص لك قطعة فريدة.' : 'No piece has been reserved for you yet. Request a bespoke fitting, and we will reserve a unique piece for you.'}
            </p>
            <Link href={'/bespoke' as any} className="btn btn-champagne inline-flex mt-10">
              {isAr ? 'ابدأ طلب التفصيل' : 'Begin a bespoke inquiry'}
            </Link>
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24">
            {pieces.map((piece, i) => (
              <article key={piece.id} className={`grid md:grid-cols-12 gap-8 md:gap-16 items-start ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
                <Link href={`/product/${piece.product.slug}` as any} className="md:col-span-7 [direction:initial] block group" data-sound="hover">
                  <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">
                    <Editorial variant="v5" ratio="auto" src={piece.product.images[0]?.url} alt={piece.product.nameEn} className="absolute inset-0 group-hover:scale-105 transition-transform duration-1000" />
                    {/* Edition stamp */}
                    {piece.edition && (
                      <div className="absolute top-6 right-6 rtl:left-6 rtl:right-auto border border-accent text-accent text-[10px] tracking-[0.3em] uppercase px-3 py-1.5 bg-onyx/60 backdrop-blur-sm">
                        {piece.edition}
                      </div>
                    )}
                  </div>
                </Link>
                <div className={`md:col-span-5 [direction:initial] ${isAr ? 'text-right' : 'text-left'}`}>
                  <div className="text-[10px] tracking-[0.3em] uppercase text-accent mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                    {isAr ? '✦ خصِّصت لك' : '✦ RESERVED FOR YOU'}
                  </div>
                  <h2 className="serif text-3xl md:text-5xl font-light mb-4" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
                    {isAr ? piece.product.nameAr : piece.product.nameEn}
                  </h2>
                  <p className="text-fg-secondary text-base md:text-lg leading-relaxed font-light mb-6">
                    {isAr ? piece.product.descAr : piece.product.descEn}
                  </p>
                  {piece.personalNote && (
                    <blockquote className="serif italic text-base md:text-lg text-fg leading-relaxed border-l-2 border-accent pl-4 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-4 my-6" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
                      «{piece.personalNote}»
                      <footer className="text-xs text-fg-tertiary mt-3 not-italic">— {isAr ? 'عقيل' : 'Aqeel'}</footer>
                    </blockquote>
                  )}
                  <div className="mt-6 text-2xl font-light">
                    <span className="num">{fmtNumber(piece.product.priceIQD)}</span> <span className="text-fg-tertiary text-base ml-2">{isAr ? 'د.ع' : 'IQD'}</span>
                  </div>
                  <Link href={`/product/${piece.product.slug}` as any} className="btn btn-champagne mt-8 inline-flex">
                    {isAr ? 'احجز قطعتك' : 'Claim your piece'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
