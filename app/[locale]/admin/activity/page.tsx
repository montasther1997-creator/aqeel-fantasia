import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

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

  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const where: any = {};
  if (sp.action) where.action = sp.action;
  if (sp.entity) where.entity = sp.entity;
  if (sp.admin) where.adminId = sp.admin;

  const [logs, total, admins, actions, entities] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { admin: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.activityLog.count({ where }),
    prisma.adminUser.findMany({ select: { id: true, name: true } }),
    prisma.activityLog.findMany({ distinct: ['action'], select: { action: true }, take: 50 }),
    prisma.activityLog.findMany({ distinct: ['entity'], select: { entity: true }, take: 50 }),
  ]);

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
    <div>
      <p className="text-xs tracking-cinematic text-muted">— SYSTEM</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Activity Log ({total})</h1>

      <form className="glass p-4 mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted tracking-cinematic uppercase block mb-1">Action</label>
          <select name="action" defaultValue={sp.action || ''} className="input">
            <option value="">All</option>
            {actions.map((a) => a.action && <option key={a.action} value={a.action}>{a.action}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted tracking-cinematic uppercase block mb-1">Entity</label>
          <select name="entity" defaultValue={sp.entity || ''} className="input">
            <option value="">All</option>
            {entities.map((e) => e.entity && <option key={e.entity} value={e.entity}>{e.entity}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted tracking-cinematic uppercase block mb-1">Admin</label>
          <select name="admin" defaultValue={sp.admin || ''} className="input">
            <option value="">All</option>
            {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <button className="btn-primary">Filter</button>
        <Link href={`/${locale}/admin/activity`} className="btn-ghost">Reset</Link>
      </form>

      <div className="glass">
        {logs.length === 0 ? (
          <p className="p-6 text-muted text-sm">No activity matches.</p>
        ) : logs.map((l) => (
          <div key={l.id} className="border-b border-line/40 p-3 grid grid-cols-12 gap-3 text-sm">
            <span className="col-span-2 font-mono text-xs text-muted">{l.createdAt.toLocaleString()}</span>
            <span className="col-span-2 text-frost">{l.admin?.name || '—'}</span>
            <span className="col-span-2 text-electric uppercase tracking-cinematic text-xs">{l.action}</span>
            <span className="col-span-2 text-muted">{l.entity}</span>
            <span className="col-span-4 text-xs text-muted truncate">{l.details}</span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-xs">
          <span className="text-muted">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs({ page: page - 1 })} className="btn-ghost">Prev</Link>}
            {page < totalPages && <Link href={qs({ page: page + 1 })} className="btn-ghost">Next</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
