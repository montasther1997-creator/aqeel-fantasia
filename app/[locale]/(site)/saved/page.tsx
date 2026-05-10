import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
import { BottomNav } from '@/components/atelier/bottomnav';
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
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body has-bottomnav">
        <TopBar />
        <header className={`px-6 pt-8 pb-6 ${isAr ? 'text-right' : 'text-left'}`}>
          <h1 className="serif text-4xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('title')}</h1>
        </header>
        {items.length === 0 ? (
          <p className="px-6 text-fg-secondary serif italic font-light">{t('empty')}</p>
        ) : (
          <div className="px-6 grid grid-cols-2 gap-3">
            {items.map((w) => <ProductCard key={w.id} p={w.product} saved />)}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
