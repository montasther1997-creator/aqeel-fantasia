import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ProductForm } from '@/components/admin/product-form';
import { getTranslations } from 'next-intl/server';

export default async function NewProduct({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const t = await getTranslations('admin.productNew');
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
  const collections = await prisma.collection.findMany({ orderBy: { order: 'asc' } });
  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
        </div>
      </header>
      <ProductForm categories={categories} collections={collections} />
    </div>
  );
}
