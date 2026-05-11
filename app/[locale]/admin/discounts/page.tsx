import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { DiscountManager } from '@/components/admin/discount-manager';
import { getTranslations } from 'next-intl/server';

export default async function DiscountsAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.discounts');
  const items = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-6">{t('title')}</h1>
      <DiscountManager initial={items} />
    </div>
  );
}
