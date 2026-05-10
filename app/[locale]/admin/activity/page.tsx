import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export default async function ActivityAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const logs = await prisma.activityLog.findMany({ include: { admin: true }, orderBy: { createdAt: 'desc' }, take: 200 });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— SYSTEM</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Activity Log</h1>
      <div className="glass">
        {logs.map((l) => (
          <div key={l.id} className="border-b border-line/40 p-3 grid grid-cols-12 gap-3 text-sm">
            <span className="col-span-2 font-mono text-xs text-muted">{l.createdAt.toLocaleString()}</span>
            <span className="col-span-2 text-frost">{l.admin?.name || '—'}</span>
            <span className="col-span-2 text-electric uppercase tracking-cinematic text-xs">{l.action}</span>
            <span className="col-span-2 text-muted">{l.entity}</span>
            <span className="col-span-4 text-xs text-muted truncate">{l.details}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
