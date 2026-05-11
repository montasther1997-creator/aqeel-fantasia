import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CustomerActions } from '@/components/admin/customer-actions';
import { TierChanger } from '@/components/admin/tier-changer';
import { getTranslations } from 'next-intl/server';

export default async function CustomerDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requireAdmin(locale);
  const t = await getTranslations('admin.customerDetail');
  const ts = await getTranslations('admin.orderActions.statusOpts');
  const [customer, tiers, history] = await Promise.all([
    prisma.customer.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: 'desc' } }, addresses: true, cultMember: true },
    }),
    prisma.cultTier.findMany({ where: { active: true }, orderBy: { pointsThreshold: 'asc' }, select: { id: true, slug: true, nameAr: true, nameEn: true, color: true } }),
    prisma.tierHistory.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { tier: { select: { nameAr: true, nameEn: true } } },
    }),
  ]);
  if (!customer) notFound();
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2">{customer.name}</h1>
      <p className="text-muted font-mono text-sm">{customer.phone}{customer.email && ` · ${customer.email}`}</p>
      <div className="mt-6"><CustomerActions id={customer.id} vipTier={customer.vipTier} blocked={customer.blocked} notes={customer.notes || ''} /></div>
      <div className="mt-6">
        <TierChanger
          customerId={customer.id}
          currentTierId={customer.cultMember?.tierId || null}
          tiers={tiers}
          history={history.map((h) => ({
            id: h.id,
            tierId: h.tierId,
            previousTier: h.previousTier,
            reason: h.reason,
            pointsAtChange: h.pointsAtChange,
            createdAt: h.createdAt.toISOString(),
            tier: h.tier,
          }))}
        />
      </div>
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="glass p-6"><p className="text-xs tracking-cinematic text-muted">{t('stats.orders')}</p><p className="h-display text-3xl mt-2">{customer.orders.length}</p></div>
        <div className="glass p-6"><p className="text-xs tracking-cinematic text-muted">{t('stats.spent')}</p><p className="h-display text-3xl mt-2">${customer.totalSpent.toLocaleString()}</p></div>
        <div className="glass p-6"><p className="text-xs tracking-cinematic text-muted">{t('stats.loyalty')}</p><p className="h-display text-3xl mt-2">{customer.loyaltyPts}</p></div>
      </div>
      <div className="glass p-6 mt-6">
        <h3 className="text-xs tracking-cinematic text-muted mb-4">— {t('sections.orders')}</h3>
        {customer.orders.length === 0 ? <p className="text-muted text-sm">—</p> :
          <div className="divide-y divide-line">
            {customer.orders.map((o) => (
              <div key={o.id} className="py-3 flex justify-between text-sm">
                <span className="font-mono text-xs">{o.number}</span>
                <span className="text-electric text-[10px] uppercase tracking-cinematic">{ts(o.status as any)}</span>
                <span>{o.currency} {o.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
