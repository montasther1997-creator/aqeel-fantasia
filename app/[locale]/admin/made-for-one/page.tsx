import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { MadeForOneManager } from '@/components/admin/made-for-one-manager';
import { getTranslations } from 'next-intl/server';

export default async function MadeForOneAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.madeForOne');
  const [items, products, customers] = await Promise.all([
    prisma.madeForOne.findMany({ include: { product: true, customer: true }, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ where: { active: true }, select: { id: true, nameEn: true, slug: true } }),
    prisma.customer.findMany({ select: { id: true, name: true, phone: true } }),
  ]);
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-6">{t('title')}</h1>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        {t('description')}
      </p>
      <MadeForOneManager initial={items} products={products} customers={customers} />
    </div>
  );
}
