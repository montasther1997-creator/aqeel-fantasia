import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { MadeForOneManager } from '@/components/admin/made-for-one-manager';
import { getTranslations } from 'next-intl/server';

export default async function MadeForOneAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.madeForOne');
  const items = await prisma.madeForOne.findMany({ include: { product: true, customer: true }, orderBy: { createdAt: 'desc' } });
  const products = await prisma.product.findMany({ where: { active: true }, select: { id: true, nameEn: true, slug: true } });
  const customers = await prisma.customer.findMany({ select: { id: true, name: true, phone: true } });
  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted num mt-3">{items.length}</p>
        </div>
      </header>
      <p className="text-sm text-muted max-w-2xl">
        {t('description')}
      </p>
      <MadeForOneManager initial={items} products={products} customers={customers} />
    </div>
  );
}
