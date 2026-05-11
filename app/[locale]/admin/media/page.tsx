import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { MediaLibrary } from '@/components/admin/media-library';
import { getTranslations } from 'next-intl/server';

export default async function MediaAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.media');
  const items = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-6">{t('count', { count: items.length })}</h1>
      <MediaLibrary initial={items} />
    </div>
  );
}
