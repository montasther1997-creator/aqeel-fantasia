import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ArchiveManager } from '@/components/admin/archive-manager';

export default async function ArchiveAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const items = await prisma.archiveItem.findMany({ orderBy: { order: 'asc' } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— CONTENT</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Archive</h1>
      <ArchiveManager initial={items} />
    </div>
  );
}
