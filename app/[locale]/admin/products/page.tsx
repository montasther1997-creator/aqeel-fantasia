import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Edit, Eye, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function ProductsAdmin({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  await requireAdmin(locale);
  const t = await getTranslations('admin.products');
  const where = sp.q ? {
    OR: [
      { nameEn: { contains: sp.q } },
      { nameAr: { contains: sp.q } },
      { sku: { contains: sp.q } },
    ],
  } : {};
  const products = await prisma.product.findMany({
    where, include: { images: { take: 1 }, category: true }, orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
          <h1 className="h-display text-4xl mt-2">{t('count', { count: products.length })}</h1>
        </div>
        <Link href={`/${locale}/admin/products/new`} className="btn-primary"><Plus className="w-4 h-4" /> {t('new')}</Link>
      </div>

      <form className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input name="q" defaultValue={sp.q} placeholder={t('searchPlaceholder')} className="input pl-10" />
        </div>
        <button className="btn-ghost">{t('search')}</button>
      </form>

      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-xs tracking-cinematic text-muted">
            <tr>
              <th className="p-3 text-left">{t('th.image')}</th>
              <th className="p-3 text-left">{t('th.name')}</th>
              <th className="p-3 text-left">{t('th.sku')}</th>
              <th className="p-3 text-left">{t('th.category')}</th>
              <th className="p-3 text-left">{t('th.priceIQD')}</th>
              <th className="p-3 text-left">{t('th.stock')}</th>
              <th className="p-3 text-left">{t('th.status')}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line/40 hover:bg-white/5">
                <td className="p-3"><div className="w-12 h-12 bg-bg-secondary">{p.images[0] && <img src={p.images[0].url} className="w-full h-full object-cover" />}</div></td>
                <td className="p-3">
                  <p className="text-frost">{p.nameEn}</p>
                  <p className="text-xs text-muted">{p.nameAr}</p>
                </td>
                <td className="p-3 font-mono text-xs">{p.sku}</td>
                <td className="p-3 text-muted">{p.category?.nameEn || '—'}</td>
                <td className="p-3">{p.priceIQD.toLocaleString()}</td>
                <td className={`p-3 ${p.stock < 5 ? 'text-blood' : ''}`}>{p.stock}</td>
                <td className="p-3">
                  <span className={`text-[10px] tracking-cinematic uppercase ${p.active ? 'text-electric' : 'text-muted'}`}>
                    {p.active ? t('active') : t('hidden')}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <Link href={`/${locale}/product/${p.slug}`} target="_blank" className="text-muted hover:text-frost"><Eye className="w-4 h-4" /></Link>
                  <Link href={`/${locale}/admin/products/${p.id}`} className="text-muted hover:text-frost"><Edit className="w-4 h-4" /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
