import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { LanguagesManager } from '@/components/admin/languages-manager';
import Link from 'next/link';

export default async function Languages({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const settings = await prisma.setting.findMany({ where: { group: 'languages' } });
  const defaultLang = settings.find((s) => s.key === 'languages.default')?.value || 'ar';
  const arActive = settings.find((s) => s.key === 'languages.ar.active')?.value !== 'false';
  const enActive = settings.find((s) => s.key === 'languages.en.active')?.value !== 'false';

  const contentCount = await prisma.siteContent.count();

  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— SYSTEM</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Languages</h1>
      <LanguagesManager initial={{ defaultLang, arActive, enActive }} />

      <div className="mt-8 glass p-6">
        <h3 className="text-xs tracking-cinematic text-muted mb-4">— CONTENT TRANSLATIONS</h3>
        <p className="text-sm text-frost/80 mb-2">
          You have <span className="text-electric font-mono">{contentCount}</span> translatable content keys.
        </p>
        <p className="text-xs text-muted mb-4">
          Each key has both Arabic and English values. Edit them in the Content section.
        </p>
        <Link href={`/${locale}/admin/content`} className="btn-ghost inline-flex">
          Edit Translations →
        </Link>
      </div>
    </div>
  );
}
