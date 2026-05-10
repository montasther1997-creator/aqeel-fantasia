import { prisma } from '@/lib/db';
import { getLocale, getTranslations } from 'next-intl/server';
import { CultTiers } from '@/components/site/cult-tiers';

export const revalidate = 60;

export default async function CultPage() {
  const t = await getTranslations('cult');
  const tiers = await prisma.cultTier.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
  return (
    <div className="pt-32 container-x pb-32">
      <p className="text-xs tracking-cinematic text-muted">— MEMBERSHIP</p>
      <h1 className="h-display text-7xl sm:text-9xl mt-4">{t('title')}</h1>
      <p className="mt-6 text-muted text-lg max-w-xl">{t('subtitle')}</p>
      <CultTiers tiers={tiers} />
    </div>
  );
}
