import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getActiveTiersOrdered, findTierForPoints, findNextTier, parsePerks } from '@/lib/loyalty';

export async function GET() {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { id: me.id },
    include: { cultMember: { include: { tier: true } } },
  });
  if (!customer) return NextResponse.json({ ok: false }, { status: 404 });

  const tiers = await getActiveTiersOrdered();
  const points = customer.loyaltyPts;
  const currentTier = customer.cultMember?.tier
    || findTierForPoints(tiers, points)
    || null;
  const nextTier = findNextTier(tiers, currentTier?.id || null);
  const pointsToNext = nextTier ? Math.max(0, nextTier.pointsThreshold - points) : 0;

  return NextResponse.json({
    ok: true,
    points,
    totalSpent: customer.totalSpent,
    currentTier: currentTier ? {
      id: currentTier.id,
      slug: currentTier.slug,
      nameAr: currentTier.nameAr,
      nameEn: currentTier.nameEn,
      color: currentTier.color,
      multiplier: currentTier.multiplier,
      freeShipping: currentTier.freeShipping,
      discountPct: currentTier.discountPct,
      earlyAccess: currentTier.earlyAccess,
      perks: parsePerks(currentTier.perks),
      pointsThreshold: currentTier.pointsThreshold,
    } : null,
    nextTier: nextTier ? {
      id: nextTier.id,
      slug: nextTier.slug,
      nameAr: nextTier.nameAr,
      nameEn: nextTier.nameEn,
      pointsThreshold: nextTier.pointsThreshold,
      pointsToNext,
    } : null,
    allTiers: tiers.map((t) => ({
      id: t.id,
      slug: t.slug,
      nameAr: t.nameAr,
      nameEn: t.nameEn,
      pointsThreshold: t.pointsThreshold,
      multiplier: t.multiplier,
      color: t.color,
      perks: parsePerks(t.perks),
      freeShipping: t.freeShipping,
      discountPct: t.discountPct,
      earlyAccess: t.earlyAccess,
    })),
  });
}
