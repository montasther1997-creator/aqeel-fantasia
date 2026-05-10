import { GateHero } from '@/components/site/gate-hero';
import { FeaturedDrops } from '@/components/site/featured-drops';
import { Manifesto } from '@/components/site/manifesto';
import { MarqueeBand } from '@/components/site/marquee-band';
import { CultTeaser } from '@/components/site/cult-teaser';
import { SignalBand } from '@/components/site/signal-band';
import { EditorialBand } from '@/components/site/editorial-band';
import { StatsCounter } from '@/components/site/stats-counter';
import { prisma } from '@/lib/db';

export const revalidate = 60;

export default async function GatePage() {
  const [products, tiers] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
      take: 8,
    }),
    prisma.cultTier.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ]);

  return (
    <>
      <GateHero />
      <MarqueeBand items={['AQEEL FANTASIA', 'NEW DROP_01', 'JOIN THE CULT', 'UNDERGROUND', 'SHADOW EDITION', 'BUILT IN BAGHDAD', '2026']} />
      <FeaturedDrops products={products} />
      <EditorialBand />
      <StatsCounter />
      <Manifesto />
      <MarqueeBand items={['LIMITED EDITIONS', 'NIGHTLIFE', 'CINEMATIC', 'BUILT IN THE DARK', 'NO PERMISSION']} />
      <CultTeaser tiers={tiers} />
      <SignalBand />
    </>
  );
}
