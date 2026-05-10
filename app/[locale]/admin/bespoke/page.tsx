import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export default async function BespokeAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const requests = await prisma.bespokeRequest.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— ATELIER</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Bespoke Requests ({requests.length})</h1>
      <div className="glass divide-y divide-line">
        {requests.length === 0 ? (
          <p className="p-6 text-muted text-sm">No bespoke requests yet.</p>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted mt-1 font-mono">{r.phone}{r.email && ` · ${r.email}`}</p>
                </div>
                <span className="text-[10px] tracking-cinematic uppercase text-accent">{r.status}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-frost/80">
                <div><span className="text-muted text-xs">Occasion:</span> {r.occasion}</div>
                {r.preferredDate && <div><span className="text-muted text-xs">Date:</span> {r.preferredDate}</div>}
                {r.fitPreference && <div className="sm:col-span-2"><span className="text-muted text-xs">Fit:</span> {r.fitPreference}</div>}
                {r.fabricPreference && <div><span className="text-muted text-xs">Fabric:</span> {r.fabricPreference}</div>}
                {r.budget && <div><span className="text-muted text-xs">Budget:</span> {r.budget}</div>}
                {r.city && <div><span className="text-muted text-xs">City:</span> {r.city}</div>}
                <div><span className="text-muted text-xs">Contact via:</span> {r.contactMethod}</div>
                {r.notes && <div className="sm:col-span-2"><span className="text-muted text-xs">Notes:</span> {r.notes}</div>}
              </div>
              <p className="text-xs text-muted mt-3">{new Date(r.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
