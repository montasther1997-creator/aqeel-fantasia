import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { SmartSettings } from '@/components/admin/smart-settings';
import { getTranslations } from 'next-intl/server';

export default async function SettingsAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const t = await getTranslations('admin.settings');
  const items = await prisma.setting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted num mt-3">{items.length}</p>
        </div>
      </header>
      <SmartSettings items={items} />
    </div>
  );
}
