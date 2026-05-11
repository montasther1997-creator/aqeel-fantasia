import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { LanguagesManager } from '@/components/admin/languages-manager';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function Languages({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.languages');
  const settings = await prisma.setting.findMany({ where: { group: 'languages' } });
  const defaultLang = settings.find((s) => s.key === 'languages.default')?.value || 'ar';
  const arActive = settings.find((s) => s.key === 'languages.ar.active')?.value !== 'false';
  const enActive = settings.find((s) => s.key === 'languages.en.active')?.value !== 'false';

  const contentCount = await prisma.siteContent.count();

  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-6">{t('title')}</h1>
      <LanguagesManager initial={{ defaultLang, arActive, enActive }} />

      <div className="mt-8 glass p-6">
        <h3 className="text-xs tracking-cinematic text-muted mb-4">— {t('translationsTitle')}</h3>
        <p className="text-sm text-frost/80 mb-2">
          {t('translationsCount', { count: contentCount })}
        </p>
        <p className="text-xs text-muted mb-4">
          {t('translationsHint')}
        </p>
        <Link href={`/${locale}/admin/content`} className="btn-ghost inline-flex">
          {t('editTranslations')} →
        </Link>
      </div>
    </div>
  );
}
