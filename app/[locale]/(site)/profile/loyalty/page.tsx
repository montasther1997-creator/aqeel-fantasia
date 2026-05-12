import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Crown, Sparkles, Truck, Clock, Percent, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getActiveTiersOrdered, findTierForPoints, findNextTier, parsePerks } from '@/lib/loyalty';

export const dynamic = 'force-dynamic';

export default async function LoyaltyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const me = await getCustomer();
  if (!me) redirect(`/${locale}/auth`);

  const customer = await prisma.customer.findUnique({
    where: { id: me.id },
    select: { loyaltyPts: true, cultMember: { select: { tierId: true } } },
  });
  const tiers = await getActiveTiersOrdered();
  const history = await prisma.tierHistory.findMany({
    where: { customerId: me.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (!customer) redirect(`/${locale}/auth`);

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
  const BackIcon = isAr ? ChevronRight : ChevronLeft;

  return (
    <div className="min-h-screen">
      <div className="container-x py-10 md:py-16">
        <Link href={'/profile' as any} className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-fg-tertiary hover:text-fg mb-8"
              style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          <BackIcon className="w-4 h-4" />
          {isAr ? 'العودة إلى الحساب' : 'Back to account'}
        </Link>

        <header className={`mb-10 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3 inline-flex items-center gap-2"
               style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            <Crown className="w-3 h-3" style={{ color: accent }} />
            {isAr ? 'النادي الحصري' : 'CULT'}
          </div>
          <h1 className="serif text-4xl md:text-5xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {isAr ? 'برنامج الولاء' : 'Loyalty'}
          </h1>
        </header>

        <div className="border border-border bg-bg-elevated/40">
          <div className="p-6 md:p-10" style={{ borderTop: `3px solid ${accent}` }}>
            <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-6 ${isAr ? 'md:flex-row-reverse' : ''}`}>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-2"
                     style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                  {isAr ? 'مستواك' : 'YOUR TIER'}
                </div>
                <div className="serif text-3xl md:text-4xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                  {currentTier ? (isAr ? currentTier.nameAr : currentTier.nameEn) : (isAr ? 'لست عضوًا بعد' : 'Not a member yet')}
                </div>
              </div>
              <div className={isAr ? 'text-right md:text-left' : 'text-left md:text-right'}>
                <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-1"
                     style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                  {isAr ? 'نقاطك' : 'POINTS'}
                </div>
                <div className="serif text-4xl md:text-5xl font-light" style={{ color: accent }}>
                  <span className="num">{points.toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>

            {nextTier && (
              <div className="mt-8">
                <div className="flex justify-between text-[10px] text-fg-tertiary mb-2">
                  <span>{currentTier ? (isAr ? currentTier.nameAr : currentTier.nameEn) : '—'}</span>
                  <span>{isAr ? nextTier.nameAr : nextTier.nameEn}</span>
                </div>
                <div className="h-1 bg-border relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 transition-all" style={{ width: `${progress}%`, background: accent }} />
                </div>
                <p className="mt-3 text-xs text-fg-tertiary text-center">
                  {isAr
                    ? <><span className="num">{pointsToNext.toLocaleString('en-US')}</span>{' '}نقطة للمستوى التالي</>
                    : <><span className="num">{pointsToNext.toLocaleString('en-US')}</span>{' pts to next tier'}</>}
                </p>
              </div>
            )}

            {currentTier && (
              <div className="mt-8">
                <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3"
                     style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                  {isAr ? 'مزاياك' : 'PERKS'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentTier.freeShipping && (
                    <Perk icon={<Truck className="w-3 h-3" />} label={isAr ? 'شحن مجاني' : 'Free shipping'} />
                  )}
                  {currentTier.earlyAccess && (
                    <Perk icon={<Clock className="w-3 h-3" />} label={isAr ? 'وصول مبكر للمجموعات' : 'Early access'} />
                  )}
                  {currentTier.discountPct > 0 && (
                    <Perk icon={<Percent className="w-3 h-3" />} label={isAr
                      ? <>خصم{' '}<span className="num">{currentTier.discountPct}</span>%</>
                      : <><span className="num">{currentTier.discountPct}</span>% off</>} />
                  )}
                  {currentTier.multiplier > 1 && (
                    <Perk icon={<Sparkles className="w-3 h-3" />} label={isAr
                      ? <>نقاط ×<span className="num">{currentTier.multiplier}</span></>
                      : <><span className="num">{currentTier.multiplier}</span>× points</>} />
                  )}
                  {perks.map((p, i) => <Perk key={i} label={p} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-12">
          <h2 className={`serif text-2xl md:text-3xl font-light mb-6 ${isAr ? 'text-right' : 'text-left'}`}
              style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {isAr ? 'كل المستويات' : 'All tiers'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiers.map((t) => {
              const isCurrent = t.id === currentTier?.id;
              return (
                <div key={t.id} className={`border p-5 ${isCurrent ? 'border-accent bg-bg-elevated/60' : 'border-border bg-bg-elevated/20'}`}>
                  <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className={isAr ? 'text-right' : 'text-left'}>
                      <div className="serif text-xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                        {isAr ? t.nameAr : t.nameEn}
                      </div>
                      <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mt-1"
                           style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                        {isAr ? <>من{' '}<span className="num">{t.pointsThreshold.toLocaleString('en-US')}</span>{' '}نقطة</>
                              : <><span className="num">{t.pointsThreshold.toLocaleString('en-US')}</span>{' pts'}</>}
                      </div>
                    </div>
                    <Crown className="w-5 h-5" style={{ color: t.color || 'var(--accent)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {history.length > 0 && (
          <section className="mt-12">
            <h2 className={`serif text-2xl md:text-3xl font-light mb-6 ${isAr ? 'text-right' : 'text-left'}`}
                style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
              {isAr ? 'سجل المستويات' : 'Tier history'}
            </h2>
            <ul className="border border-border divide-y divide-border">
              {history.map((h) => (
                <li key={h.id} className={`p-4 flex items-center justify-between text-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-fg-secondary">
                    {new Date(h.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}
                  </span>
                  <span className="text-fg-tertiary text-xs">
                    <span className="num">{h.pointsAtChange.toLocaleString('en-US')}</span>{' '}
                    {isAr ? 'نقطة' : 'pts'} · {h.reason}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function Perk({ icon, label }: { icon?: React.ReactNode; label: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs text-fg-secondary">
      {icon}
      {label}
    </span>
  );
}
