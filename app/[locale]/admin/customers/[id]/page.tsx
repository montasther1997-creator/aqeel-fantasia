import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CustomerActions } from '@/components/admin/customer-actions';

export default async function CustomerDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requireAdmin(locale);
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: 'desc' } }, addresses: true },
  });
  if (!customer) notFound();
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— CUSTOMER</p>
      <h1 className="h-display text-4xl mt-2">{customer.name}</h1>
      <p className="text-muted font-mono text-sm">{customer.phone}{customer.email && ` · ${customer.email}`}</p>
      <div className="mt-6"><CustomerActions id={customer.id} vipTier={customer.vipTier} blocked={customer.blocked} notes={customer.notes || ''} /></div>
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="glass p-6"><p className="text-xs tracking-cinematic text-muted">ORDERS</p><p className="h-display text-3xl mt-2">{customer.orders.length}</p></div>
        <div className="glass p-6"><p className="text-xs tracking-cinematic text-muted">SPENT</p><p className="h-display text-3xl mt-2">${customer.totalSpent.toLocaleString()}</p></div>
        <div className="glass p-6"><p className="text-xs tracking-cinematic text-muted">LOYALTY</p><p className="h-display text-3xl mt-2">{customer.loyaltyPts}</p></div>
      </div>
      <div className="glass p-6 mt-6">
        <h3 className="text-xs tracking-cinematic text-muted mb-4">— ORDERS</h3>
        {customer.orders.length === 0 ? <p className="text-muted text-sm">—</p> :
          <div className="divide-y divide-line">
            {customer.orders.map((o) => (
              <div key={o.id} className="py-3 flex justify-between text-sm">
                <span className="font-mono text-xs">{o.number}</span>
                <span className="text-electric text-[10px] uppercase tracking-cinematic">{o.status}</span>
                <span>{o.currency} {o.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
