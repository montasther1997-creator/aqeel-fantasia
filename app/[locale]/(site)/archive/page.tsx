import { prisma } from '@/lib/db';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArchiveGrid } from '@/components/site/archive-grid';

export const revalidate = 60;

export default async function ArchivePage() {
  const t = await getTranslations('archive');
  const items = await prisma.archiveItem.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
  return (
    <div className="pt-32 container-x">
      <p className="text-xs tracking-cinematic text-muted">— ARCHIVE 2026</p>
      <h1 className="h-display text-7xl sm:text-9xl mt-4">{t('title')}</h1>
      <p className="mt-6 text-muted text-lg max-w-xl">{t('subtitle')}</p>
      <ArchiveGrid items={items} />
    </div>
  );
}
