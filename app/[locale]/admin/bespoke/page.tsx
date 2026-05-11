import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { BespokeRow } from './bespoke-row';
import { getTranslations } from 'next-intl/server';

export default async function BespokeAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.bespoke');
  const requests = await prisma.bespokeRequest.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted num mt-3">{requests.length}</p>
        </div>
      </header>
      <div className="glass divide-y divide-line">
        {requests.length === 0 ? (
          <p className="p-6 text-muted text-sm">{t('empty')}</p>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted mt-1 font-mono">{r.phone}{r.email && ` · ${r.email}`}</p>
                </div>
                <BespokeRow id={r.id} initialStatus={r.status} summary={r.name} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-frost/80">
                <div><span className="text-muted text-xs">{t('labels.occasion')}:</span> {r.occasion}</div>
                {r.preferredDate && <div><span className="text-muted text-xs">{t('labels.date')}:</span> {r.preferredDate}</div>}
                {r.fitPreference && <div className="sm:col-span-2"><span className="text-muted text-xs">{t('labels.fit')}:</span> {r.fitPreference}</div>}
                {r.fabricPreference && <div><span className="text-muted text-xs">{t('labels.fabric')}:</span> {r.fabricPreference}</div>}
                {r.budget && <div><span className="text-muted text-xs">{t('labels.budget')}:</span> {r.budget}</div>}
                {r.city && <div><span className="text-muted text-xs">{t('labels.city')}:</span> {r.city}</div>}
                <div><span className="text-muted text-xs">{t('labels.contactVia')}:</span> {r.contactMethod}</div>
                {r.notes && <div className="sm:col-span-2"><span className="text-muted text-xs">{t('labels.notes')}:</span> {r.notes}</div>}
              </div>
              <p className="text-xs text-muted mt-3">{new Date(r.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
