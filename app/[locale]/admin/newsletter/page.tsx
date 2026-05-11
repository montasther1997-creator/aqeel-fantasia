import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { Download } from 'lucide-react';
import { NewsletterRow } from './newsletter-row';
import { getTranslations } from 'next-intl/server';

export default async function Newsletter({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.newsletter');
  const subs = await prisma.newsletterSub.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
          <h1 className="h-display text-4xl mt-2">{t('count', { count: subs.length })}</h1>
        </div>
        <a href="/api/admin/newsletter/export" className="btn-ghost inline-flex items-center gap-2">
          <Download className="w-4 h-4" /> {t('exportCsv')}
        </a>
      </div>
      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-xs text-muted tracking-cinematic">
            <tr>
              <th className="p-3 text-left">{t('th.contact')}</th>
              <th className="p-3 text-left">{t('th.type')}</th>
              <th className="p-3 text-left">{t('th.status')}</th>
              <th className="p-3 text-left">{t('th.joined')}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-line/40">
                <td className="p-3 font-mono">{s.contact}</td>
                <td className="p-3 text-xs uppercase">{s.type}</td>
                <td className="p-3"><NewsletterRow id={s.id} initialActive={s.active} /></td>
                <td className="p-3 text-xs text-muted">{s.createdAt.toLocaleString()}</td>
                <td className="p-3"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
