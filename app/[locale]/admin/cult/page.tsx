import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { CultManager } from '@/components/admin/cult-manager';

export default async function CultAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const [tiers, members] = await Promise.all([
    prisma.cultTier.findMany({ orderBy: { order: 'asc' } }),
    prisma.cultMember.findMany({ include: { customer: true, tier: true } }),
  ]);
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— COMMUNITY</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Cult</h1>
      <CultManager tiers={tiers} members={members} />
    </div>
  );
}
