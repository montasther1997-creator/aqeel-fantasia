import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ProductForm } from '@/components/admin/product-form';

export default async function NewProduct({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const [categories, collections] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.collection.findMany({ orderBy: { order: 'asc' } }),
  ]);
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— NEW</p>
      <h1 className="h-display text-4xl mt-2 mb-8">Create Product</h1>
      <ProductForm categories={categories} collections={collections} />
    </div>
  );
}
