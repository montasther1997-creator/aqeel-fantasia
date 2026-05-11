import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { MadeForOneManager } from '@/components/admin/made-for-one-manager';

export default async function MadeForOneAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const [items, products, customers] = await Promise.all([
    prisma.madeForOne.findMany({ include: { product: true, customer: true }, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ where: { active: true }, select: { id: true, nameEn: true, slug: true } }),
    prisma.customer.findMany({ select: { id: true, name: true, phone: true } }),
  ]);
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— ATELIER</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Made for One</h1>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        Reserve a unique product for a single customer. Once assigned, the product remains visible publicly but is marked as "Made for One" with the customer's name.
      </p>
      <MadeForOneManager initial={items} products={products} customers={customers} />
    </div>
  );
}
