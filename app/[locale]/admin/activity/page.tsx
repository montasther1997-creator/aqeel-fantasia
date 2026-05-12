import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';

const PAGE_SIZE = 50;

export default async function ActivityAdmin({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ action?: string; entity?: string; admin?: string; page?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  await requireAdmin(locale);
  const t = await getTranslations('admin.activity');
  const isAr = locale === 'ar';

  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const where: any = {};
  if (sp.action) where.action = sp.action;
  if (sp.entity) where.entity = sp.entity;
  if (sp.admin) where.adminId = sp.admin;

  // Sequential — pool=1
  const logs = await prisma.activityLog.findMany({
    where,
    include: { admin: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const total = await prisma.activityLog.count({ where });
  const admins = await prisma.adminUser.findMany({ select: { id: true, name: true } });
  const actions = await prisma.activityLog.findMany({ distinct: ['action'], select: { action: true }, take: 50 });
  const entities = await prisma.activityLog.findMany({ distinct: ['entity'], select: { entity: true }, take: 50 });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const all = { action: sp.action, entity: sp.entity, admin: sp.admin, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(all)) {
      if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
    }
    return '?' + params.toString();
  };

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted num mt-3">{total}</p>
        </div>
      </header>

      <form className="ed-card flex flex-wrap items-end gap-4">
        <div>
          <label className="ed-eye block mb-2">{t('filters.action')}</label>
          <select name="action" defaultValue={sp.action || ''} className="input min-w-[160px]">
            <option value="">{t('all')}</option>
            {actions.map((a) => a.action && <option key={a.action} value={a.action}>{a.action}</option>)}
          </select>
        </div>
        <div>
          <label className="ed-eye block mb-2">{t('filters.entity')}</label>
          <select name="entity" defaultValue={sp.entity || ''} className="input min-w-[160px]">
            <option value="">{t('all')}</option>
            {entities.map((e) => e.entity && <option key={e.entity} value={e.entity}>{e.entity}</option>)}
          </select>
        </div>
        <div>
          <label className="ed-eye block mb-2">{t('filters.admin')}</label>
          <select name="admin" defaultValue={sp.admin || ''} className="input min-w-[160px]">
            <option value="">{t('all')}</option>
            {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <button className="btn-primary">{t('filter')}</button>
        <Link href={`/${locale}/admin/activity`} className="btn-ghost">{t('reset')}</Link>
      </form>

      <div className="ed-card overflow-x-auto p-0">
        <table className="ed-table">
          <thead>
            <tr>
              <th>{t('th.time')}</th>
              <th>{t('th.admin')}</th>
              <th>{t('th.action')}</th>
              <th>{t('th.entity')}</th>
              <th>{t('th.details')}</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={5}><p className="ed-caption text-muted text-center py-8">{t('empty')}</p></td></tr>
            )}
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="muted num-col font-mono text-xs">{l.createdAt.toLocaleString(isAr ? 'ar-IQ' : 'en-US')}</td>
                <td>{l.admin?.name || '—'}</td>
                <td><span className="ed-pill accent">{l.action}</span></td>
                <td className="muted">{l.entity || '—'}</td>
                <td className="muted text-xs truncate max-w-[280px]">{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-muted num">{t('pageOf', { page, total: totalPages })}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs({ page: page - 1 })} className="btn-ghost">{t('prev')}</Link>}
            {page < totalPages && <Link href={qs({ page: page + 1 })} className="btn-ghost">{t('next')}</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
