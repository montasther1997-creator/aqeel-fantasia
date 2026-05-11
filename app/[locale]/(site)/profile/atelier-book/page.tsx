import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { AtelierBookForm } from '@/components/atelier/atelier-book-form';

export default async function AtelierBookPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const me = await getCustomer();
  if (!me) redirect({ href: '/auth', locale });

  const customer = await prisma.customer.findUnique({ where: { id: me!.id } });

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x max-w-3xl">
        <header className={`mb-12 md:mb-16 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-accent mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {isAr ? '✦ دفتر الدار' : '✦ THE ATELIER BOOK'}
          </div>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {isAr ? 'دفترك في الدار.' : 'Your atelier book.'}
          </h1>
          <p className="serif italic text-base md:text-lg text-fg-secondary mt-4 font-light max-w-xl" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
            {isAr ? 'تفضيلاتك ومقاساتك — كي يأتيك الأتيليه بما يلائمك تماماً.' : 'Your preferences and measurements — so the atelier reaches you with what fits exactly.'}
          </p>
        </header>

        <AtelierBookForm initial={customer} />
      </div>
    </div>
  );
}
