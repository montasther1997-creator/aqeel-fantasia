import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { Download } from 'lucide-react';
import { NewsletterRow } from './newsletter-row';
import { getTranslations } from 'next-intl/server';

export default async function Newsletter({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.newsletter');
  const isAr = locale === 'ar';
  const subs = await prisma.newsletterSub.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted num mt-3">{subs.length}</p>
        </div>
        <a href="/api/admin/newsletter/export" className="btn-ghost inline-flex items-center gap-2">
          <Download className="w-4 h-4" /> {t('exportCsv')}
        </a>
      </header>

      <div className="ed-card overflow-x-auto p-0">
        <table className="ed-table">
          <thead>
            <tr>
              <th>{t('th.contact')}</th>
              <th>{t('th.type')}</th>
              <th>{t('th.status')}</th>
              <th>{t('th.joined')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr><td colSpan={5}><p className="ed-caption text-muted text-center py-8">{t('empty')}</p></td></tr>
            )}
            {subs.map((s) => (
              <tr key={s.id}>
                <td className="font-mono num-col">{s.contact}</td>
                <td><span className="ed-pill">{s.type}</span></td>
                <td><NewsletterRow id={s.id} initialActive={s.active} /></td>
                <td className="muted num-col">{s.createdAt.toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
