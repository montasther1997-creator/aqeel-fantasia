import { Link } from '@/i18n/routing';
import { Crown, Sparkles, Truck, Clock, Percent } from 'lucide-react';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getActiveTiersOrdered, findTierForPoints, findNextTier, parsePerks } from '@/lib/loyalty';

export async function LoyaltyCard({ locale }: { locale: 'ar' | 'en' }) {
  const me = await getCustomer();
  if (!me) return null;

  const [customer, tiers] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: me.id },
      select: { loyaltyPts: true, cultMember: { select: { tierId: true } } },
    }),
    getActiveTiersOrdered(),
  ]);
  if (!customer || tiers.length === 0) return null;

  const isAr = locale === 'ar';
  const points = customer.loyaltyPts;
  const currentTier = customer.cultMember
    ? tiers.find((t) => t.id === customer.cultMember!.tierId) || null
    : findTierForPoints(tiers, points);
  const nextTier = findNextTier(tiers, currentTier?.id || null);
  const pointsToNext = nextTier ? Math.max(0, nextTier.pointsThreshold - points) : 0;
  const progress = nextTier
    ? Math.min(100, Math.max(0, ((points - (currentTier?.pointsThreshold || 0)) / (nextTier.pointsThreshold - (currentTier?.pointsThreshold || 0))) * 100))
    : 100;

  const accent = currentTier?.color || 'var(--accent)';
  const perks = currentTier ? parsePerks(currentTier.perks) : [];

  return (
    <Link href={'/profile/loyalty' as any} className="block border border-border bg-bg-elevated/40 hover:bg-bg-elevated transition-colors group">
      <div className="p-6 md:p-8" style={{ borderTop: `3px solid ${accent}` }}>
        <div className={`flex items-start justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className={isAr ? 'text-right' : 'text-left'}>
            <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-2 inline-flex items-center gap-2"
                 style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              <Crown className="w-3 h-3" style={{ color: accent }} />
              {isAr ? 'النادي الحصري' : 'CULT'}
            </div>
            <div className="serif text-2xl md:text-3xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
              {currentTier ? (isAr ? currentTier.nameAr : currentTier.nameEn) : (isAr ? 'لست عضوًا بعد' : 'Not a member yet')}
            </div>
          </div>
          <div className={isAr ? 'text-left' : 'text-right'}>
            <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary"
                 style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {isAr ? 'نقاطك' : 'POINTS'}
            </div>
            <div className="serif text-3xl md:text-4xl font-light num" style={{ color: accent }}>
              {points.toLocaleString()}
            </div>
          </div>
        </div>

        {nextTier && (
          <div className="mt-6">
            <div className="flex justify-between text-[10px] text-fg-tertiary mb-2">
              <span>{currentTier ? (isAr ? currentTier.nameAr : currentTier.nameEn) : '—'}</span>
              <span>{isAr ? nextTier.nameAr : nextTier.nameEn}</span>
            </div>
            <div className="h-1 bg-border relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 transition-all" style={{ width: `${progress}%`, background: accent }} />
            </div>
            <p className="mt-2 text-xs text-fg-tertiary text-center">
              {isAr ? `${pointsToNext.toLocaleString()} نقطة للمستوى التالي` : `${pointsToNext.toLocaleString()} pts to next tier`}
            </p>
          </div>
        )}

        {currentTier && (
          <div className="mt-6 flex flex-wrap gap-2">
            {currentTier.freeShipping && (
              <Perk icon={<Truck className="w-3 h-3" />} label={isAr ? 'شحن مجاني' : 'Free shipping'} />
            )}
            {currentTier.earlyAccess && (
              <Perk icon={<Clock className="w-3 h-3" />} label={isAr ? 'وصول مبكر' : 'Early access'} />
            )}
            {currentTier.discountPct > 0 && (
              <Perk icon={<Percent className="w-3 h-3" />} label={isAr ? `خصم ${currentTier.discountPct}%` : `${currentTier.discountPct}% off`} />
            )}
            {currentTier.multiplier > 1 && (
              <Perk icon={<Sparkles className="w-3 h-3" />} label={isAr ? `نقاط ×${currentTier.multiplier}` : `${currentTier.multiplier}× points`} />
            )}
            {perks.slice(0, 2).map((p, i) => (
              <Perk key={i} label={p} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function Perk({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 text-[10px] tracking-wide text-fg-secondary">
      {icon}
      {label}
    </span>
  );
}
