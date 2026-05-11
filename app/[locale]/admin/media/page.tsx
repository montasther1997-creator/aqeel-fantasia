import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { MediaLibrary } from '@/components/admin/media-library';
import { getTranslations } from 'next-intl/server';

export default async function MediaAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.media');
  const items = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted num mt-3">{items.length}</p>
        </div>
      </header>
      <MediaLibrary initial={items} />
    </div>
  );
}
