import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { CollectionManager } from '@/components/admin/collection-manager';

export default async function CollectionsAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const items = await prisma.collection.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { products: true } } } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— CATALOG</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Collections / Drops</h1>
      <CollectionManager initial={items} />
    </div>
  );
}
