import { prisma } from './db';

const DEFAULT_IQD_PER_POINT = 1000;
const DEFAULT_POINTS_PER_USD = 1;

type LoyaltyConfig = {
  iqdPerPoint: number;
  pointsPerUSD: number;
};

export async function getLoyaltyConfig(): Promise<LoyaltyConfig> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: ['loyalty.iqdPerPoint', 'loyalty.pointsPerUSD'] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    iqdPerPoint: Number(map.get('loyalty.iqdPerPoint')) || DEFAULT_IQD_PER_POINT,
    pointsPerUSD: Number(map.get('loyalty.pointsPerUSD')) || DEFAULT_POINTS_PER_USD,
  };
}

export function computePointsEarned(
  amount: number,
  currency: 'IQD' | 'USD',
  config: LoyaltyConfig,
  multiplier = 1,
): number {
  const base = currency === 'IQD'
    ? amount / config.iqdPerPoint
    : amount * config.pointsPerUSD;
  return Math.max(0, Math.floor(base * multiplier));
}

export type TierLite = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  pointsThreshold: number;
  multiplier: number;
  freeShipping: boolean;
  discountPct: number;
  earlyAccess: boolean;
  perks: string;
  color: string | null;
  order: number;
};

export async function getActiveTiersOrdered(): Promise<TierLite[]> {
  const tiers = await prisma.cultTier.findMany({
    where: { active: true },
    orderBy: [{ pointsThreshold: 'asc' }, { order: 'asc' }],
  });
  return tiers as TierLite[];
}

export function findTierForPoints(tiers: TierLite[], points: number): TierLite | null {
  let match: TierLite | null = null;
  for (const t of tiers) {
    if (points >= t.pointsThreshold) match = t;
    else break;
  }
  return match;
}

export function findNextTier(tiers: TierLite[], currentTierId: string | null): TierLite | null {
  if (!currentTierId) return tiers[0] || null;
  const idx = tiers.findIndex((t) => t.id === currentTierId);
  if (idx < 0 || idx >= tiers.length - 1) return null;
  return tiers[idx + 1];
}

export async function awardPointsForOrder(params: {
  customerId: string;
  amount: number;
  currency: 'IQD' | 'USD';
  tx?: any;
}): Promise<{ pointsEarned: number; newTotal: number; tierChanged: boolean; newTierId: string | null; previousTierId: string | null }> {
  const client = params.tx || prisma;
  const config = await getLoyaltyConfig();
  const tiers = await getActiveTiersOrdered();

  const customer = await client.customer.findUnique({
    where: { id: params.customerId },
    include: { cultMember: true },
  });
  if (!customer) {
    return { pointsEarned: 0, newTotal: 0, tierChanged: false, newTierId: null, previousTierId: null };
  }

  const currentTier = customer.cultMember
    ? tiers.find((t) => t.id === customer.cultMember!.tierId) || null
    : null;

  const earned = computePointsEarned(
    params.amount,
    params.currency,
    config,
    currentTier?.multiplier || 1,
  );
  const newTotal = customer.loyaltyPts + earned;

  const targetTier = findTierForPoints(tiers, newTotal);
  const tierChanged = (currentTier?.id || null) !== (targetTier?.id || null);

  await client.customer.update({
    where: { id: params.customerId },
    data: { loyaltyPts: newTotal },
  });

  if (tierChanged) {
    if (targetTier) {
      await client.cultMember.upsert({
        where: { customerId: params.customerId },
        create: { customerId: params.customerId, tierId: targetTier.id },
        update: { tierId: targetTier.id, startedAt: new Date(), active: true },
      });
    } else if (customer.cultMember) {
      await client.cultMember.delete({ where: { customerId: params.customerId } });
    }
    await client.tierHistory.create({
      data: {
        customerId: params.customerId,
        tierId: targetTier?.id || null,
        previousTier: currentTier?.slug || null,
        reason: 'auto',
        pointsAtChange: newTotal,
      },
    });
  }

  return {
    pointsEarned: earned,
    newTotal,
    tierChanged,
    newTierId: targetTier?.id || null,
    previousTierId: currentTier?.id || null,
  };
}

export async function manualSetTier(params: {
  customerId: string;
  tierId: string | null;
  adminId: string;
  reason?: string;
}): Promise<{ ok: boolean }> {
  const customer = await prisma.customer.findUnique({
    where: { id: params.customerId },
    include: { cultMember: true },
  });
  if (!customer) return { ok: false };

  const previousTier = customer.cultMember
    ? await prisma.cultTier.findUnique({ where: { id: customer.cultMember.tierId }, select: { slug: true } })
    : null;

  if (params.tierId) {
    await prisma.cultMember.upsert({
      where: { customerId: params.customerId },
      create: { customerId: params.customerId, tierId: params.tierId },
      update: { tierId: params.tierId, startedAt: new Date(), active: true },
    });
  } else if (customer.cultMember) {
    await prisma.cultMember.delete({ where: { customerId: params.customerId } });
  }

  await prisma.tierHistory.create({
    data: {
      customerId: params.customerId,
      tierId: params.tierId,
      previousTier: previousTier?.slug || null,
      reason: params.reason || 'manual',
      pointsAtChange: customer.loyaltyPts,
      adminId: params.adminId,
    },
  });

  return { ok: true };
}

export function parsePerks(perks: string): string[] {
  try {
    const parsed = JSON.parse(perks);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return perks.split(',').map((p) => p.trim()).filter(Boolean);
  }
}
