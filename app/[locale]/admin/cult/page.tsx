import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { CultManager } from '@/components/admin/cult-manager';
import { getTranslations } from 'next-intl/server';

export default async function CultAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.cult');
  const [tiers, members] = await Promise.all([
    prisma.cultTier.findMany({ orderBy: { order: 'asc' } }),
    prisma.cultMember.findMany({ include: { customer: true, tier: true } }),
  ]);
  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted num mt-3">{members.length}</p>
        </div>
      </header>
      <CultManager tiers={tiers} members={members} />
    </div>
  );
}
