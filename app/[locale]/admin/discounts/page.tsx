import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { DiscountManager } from '@/components/admin/discount-manager';

export default async function DiscountsAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const items = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— SALES</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Discounts</h1>
      <DiscountManager initial={items} />
    </div>
  );
}
