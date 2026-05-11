import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { CollectionManager } from '@/components/admin/collection-manager';
import { getTranslations } from 'next-intl/server';

export default async function CollectionsAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const t = await getTranslations('admin.collections');
  const items = await prisma.collection.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { products: true } } } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-6">{t('title')}</h1>
      <CollectionManager initial={items} />
    </div>
  );
}
