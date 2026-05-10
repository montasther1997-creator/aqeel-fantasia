import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export default async function Newsletter({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const subs = await prisma.newsletterSub.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— SIGNAL</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Newsletter ({subs.length})</h1>
      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-xs text-muted tracking-cinematic"><tr><th className="p-3 text-left">Contact</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Active</th><th className="p-3 text-left">Joined</th></tr></thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-line/40">
                <td className="p-3 font-mono">{s.contact}</td>
                <td className="p-3 text-xs uppercase">{s.type}</td>
                <td className="p-3 text-electric text-xs">{s.active ? '✓' : '—'}</td>
                <td className="p-3 text-xs text-muted">{s.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
