import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { WishlistGrid } from '@/components/site/wishlist-grid';

export default async function WishlistPage() {
  const c = await getCustomer();
  if (!c) redirect({ href: '/account/login', locale: 'ar' });
  const items = await prisma.wishlistItem.findMany({
    where: { customerId: c!.id },
    include: { product: { include: { images: { take: 1 } } } },
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div className="pt-32 pb-20 container-x">
      <h1 className="h-display text-5xl mb-10">WISHLIST</h1>
      {items.length === 0 ? <p className="text-muted">—</p> : <WishlistGrid items={items} />}
    </div>
  );
}
