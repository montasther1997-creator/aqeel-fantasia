import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { getTranslations } from 'next-intl/server';

export default async function EditProduct({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  await requireAdmin(locale);
  const t = await getTranslations('admin.productEdit');
  const [product, categories, collections] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { order: 'asc' } }, variants: true } }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.collection.findMany({ orderBy: { order: 'asc' } }),
  ]);
  if (!product) notFound();
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow', { sku: product.sku })}</p>
      <h1 className="h-display text-4xl mt-2 mb-8">{product.nameEn}</h1>
      <ProductForm product={product} categories={categories} collections={collections} />
    </div>
  );
}
