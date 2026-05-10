import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { MediaLibrary } from '@/components/admin/media-library';

export default async function MediaAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const items = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— CONTENT</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Media Library ({items.length})</h1>
      <MediaLibrary initial={items} />
    </div>
  );
}
