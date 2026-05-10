import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { CategoryManager } from '@/components/admin/category-manager';

export default async function CategoriesAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const cats = await prisma.category.findMany({ orderBy: { order: 'asc' } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— CATALOG</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Categories</h1>
      <CategoryManager initial={cats} />
    </div>
  );
}
