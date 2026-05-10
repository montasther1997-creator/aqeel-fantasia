import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { ProductCard } from '@/components/atelier/product-card';

export default async function SavedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('saved');
  const isAr = locale === 'ar';
  const me = await getCustomer();
  if (!me) redirect({ href: '/auth', locale });

  const items = await prisma.wishlistItem.findMany({
    where: { customerId: me!.id },
    include: { product: { include: { images: { take: 1 } } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x">
        <header className={`mb-12 md:mb-16 ${isAr ? 'text-right' : 'text-left'}`}>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('title')}</h1>
        </header>
        {items.length === 0 ? (
          <p className="text-fg-secondary serif italic font-light text-lg">{t('empty')}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {items.map((w) => <ProductCard key={w.id} p={w.product} saved />)}
          </div>
        )}
      </div>
    </div>
  );
}
