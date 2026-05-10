import { prisma } from '@/lib/db';
import { ProductCard } from '@/components/site/product-card';
import { getTranslations } from 'next-intl/server';

export const revalidate = 60;

export default async function DropsPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const sp = await searchParams;
  const t = await getTranslations('drops');
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, ...(sp.cat ? { category: { slug: sp.cat } } : {}) },
      include: { images: { orderBy: { order: 'asc' }, take: 2 } },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    }),
    prisma.category.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ]);

  return (
    <div className="pt-32 pb-20 container-x">
      <div className="mb-12">
        <p className="text-xs tracking-cinematic text-muted mb-3">— {products.length} ITEMS</p>
        <h1 className="h-display text-6xl sm:text-8xl">{t('title')}</h1>
        <p className="mt-4 text-muted text-lg">{t('subtitle')}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto mb-10 pb-2">
        <a href="/drops" className={`text-xs tracking-cinematic uppercase px-4 py-2 border ${!sp.cat ? 'border-frost text-frost' : 'border-line text-muted hover:text-frost'}`}>
          {t('viewAll')}
        </a>
        {categories.map((c) => (
          <a key={c.id} href={`?cat=${c.slug}`}
             className={`text-xs tracking-cinematic uppercase px-4 py-2 border whitespace-nowrap ${sp.cat === c.slug ? 'border-frost text-frost' : 'border-line text-muted hover:text-frost'}`}>
            {c.nameEn}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
      </div>
    </div>
  );
}
