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
  const isAr = locale === 'ar';
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
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted num mt-3">{products.length}</p>
        </div>
        <Link
          href={`/${locale}/admin/products/new`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {t('new')}
        </Link>
      </header>

      <form className="relative max-w-md">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted pointer-events-none" />
        <input name="q" defaultValue={sp.q} placeholder={t('searchPlaceholder')} className="input ps-10" />
      </form>

      <div className="ed-card overflow-x-auto p-0">
        <table className="ed-table">
          <thead>
            <tr>
              <th>{t('th.image')}</th>
              <th>{t('th.name')}</th>
              <th>{t('th.sku')}</th>
              <th>{t('th.category')}</th>
              <th>{t('th.priceIQD')}</th>
              <th>{t('th.stock')}</th>
              <th>{t('th.status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={8}><p className="ed-caption text-muted text-center py-8">{t('empty')}</p></td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="w-14 h-14 bg-bg overflow-hidden">
                    {p.images[0] && <img src={p.images[0].url} alt={p.nameEn} className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td>
                  <div className="serif text-base text-frost" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                    {isAr ? p.nameAr : p.nameEn}
                  </div>
                  <div className="muted text-xs mt-0.5">
                    {isAr ? p.nameEn : p.nameAr}
                  </div>
                </td>
                <td className="font-mono text-xs num-col">{p.sku}</td>
                <td className="muted">{(isAr ? p.category?.nameAr : p.category?.nameEn) || '—'}</td>
                <td className="num-col">
                  <span className="serif text-base text-frost" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                    {p.priceIQD.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted ms-1">{isAr ? 'د.ع' : 'IQD'}</span>
                </td>
                <td className="num-col">
                  <span className={p.stock < 5 ? 'text-burgundy' : ''}>{p.stock}</span>
                </td>
                <td>
                  <span className={`ed-pill ${p.active ? 'accent' : ''}`}>
                    {p.active ? t('active') : t('hidden')}
                  </span>
                </td>
                <td>
                  <div className="flex gap-3">
                    <Link href={`/${locale}/product/${p.slug}`} target="_blank" className="text-muted hover:text-accent transition-colors" aria-label="view">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/${locale}/admin/products/${p.id}`} className="text-muted hover:text-accent transition-colors" aria-label="edit">
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
