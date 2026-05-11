import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ContentEditor } from '@/components/admin/content-editor';
import { getTranslations } from 'next-intl/server';

export default async function ContentAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const t = await getTranslations('admin.content');
  const items = await prisma.siteContent.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-6">{t('title')}</h1>
      <ContentEditor items={items} />
    </div>
  );
}
