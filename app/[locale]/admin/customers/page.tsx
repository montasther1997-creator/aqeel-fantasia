import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function CustomersAdmin({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  await requireAdmin(locale);
  const t = await getTranslations('admin.customers');
  const isAr = locale === 'ar';
  const customers = await prisma.customer.findMany({
    where: sp.q ? { OR: [{ name: { contains: sp.q } }, { phone: { contains: sp.q } }, { email: { contains: sp.q } }] } : {},
    include: { _count: { select: { orders: true, addresses: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
        </div>
        <p className="ed-caption text-muted num hidden md:block">{customers.length}</p>
      </header>

      <form className="relative max-w-md">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted pointer-events-none" />
        <input name="q" defaultValue={sp.q} className="input ps-10" placeholder={t('searchPlaceholder')} />
      </form>

      <div className="ed-card overflow-x-auto p-0">
        <table className="ed-table">
          <thead>
            <tr>
              <th>{t('th.name')}</th>
              <th>{t('th.phone')}</th>
              <th>{t('th.email')}</th>
              <th>{t('th.vip')}</th>
              <th>{t('th.orders')}</th>
              <th>{t('th.spent')}</th>
              <th>{t('th.joined')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr><td colSpan={8}><p className="ed-caption text-muted text-center py-8">{t('empty')}</p></td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="serif text-base text-frost" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                    {c.name}
                  </div>
                  {c.blocked && <span className="ed-pill danger mt-1 inline-block">{t('blocked')}</span>}
                </td>
                <td className="num-col text-xs font-mono">{c.phone}</td>
                <td className="muted">{c.email || '—'}</td>
                <td>
                  {c.vipTier && c.vipTier !== 'none'
                    ? <span className="ed-pill accent">{c.vipTier}</span>
                    : <span className="text-muted text-xs">—</span>}
                </td>
                <td className="num-col">{c._count.orders}</td>
                <td className="num-col">
                  <span className="serif text-base text-frost" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                    ${c.totalSpent.toLocaleString()}
                  </span>
                </td>
                <td className="muted num-col">{c.createdAt.toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}</td>
                <td>
                  <Link
                    href={`/${locale}/admin/customers/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    {t('view')} <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
