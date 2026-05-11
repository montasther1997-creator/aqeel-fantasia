import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function CustomersAdmin({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  await requireAdmin(locale);
  const t = await getTranslations('admin.customers');
  const customers = await prisma.customer.findMany({
    where: sp.q ? { OR: [{ name: { contains: sp.q } }, { phone: { contains: sp.q } }, { email: { contains: sp.q } }] } : {},
    include: { _count: { select: { orders: true, addresses: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-6">{t('count', { count: customers.length })}</h1>
      <form className="mb-6"><input name="q" defaultValue={sp.q} className="input" placeholder={t('searchPlaceholder')} /></form>
      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-xs tracking-cinematic text-muted">
            <tr><th className="p-3 text-left">{t('th.name')}</th><th className="p-3 text-left">{t('th.phone')}</th><th className="p-3 text-left">{t('th.email')}</th><th className="p-3 text-left">{t('th.vip')}</th><th className="p-3 text-left">{t('th.orders')}</th><th className="p-3 text-left">{t('th.spent')}</th><th className="p-3 text-left">{t('th.joined')}</th><th></th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-line/40 hover:bg-white/5">
                <td className="p-3">{c.name}{c.blocked && <span className="ml-2 text-blood text-[10px]">{t('blocked')}</span>}</td>
                <td className="p-3 font-mono text-xs">{c.phone}</td>
                <td className="p-3 text-xs text-muted">{c.email || '—'}</td>
                <td className="p-3 text-[10px] tracking-cinematic uppercase">{c.vipTier}</td>
                <td className="p-3">{c._count.orders}</td>
                <td className="p-3">${c.totalSpent.toLocaleString()}</td>
                <td className="p-3 text-xs text-muted">{c.createdAt.toLocaleDateString()}</td>
                <td className="p-3"><Link href={`/${locale}/admin/customers/${c.id}`} className="text-electric text-xs">{t('view')} →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
