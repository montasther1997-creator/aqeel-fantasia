import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/atelier/product-detail';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: 'asc' } },
      variants: true,
      category: true,
      collection: true,
      notes: { where: { active: true }, take: 1, orderBy: { number: 'desc' } },
      madeForOne: { include: { customer: { select: { name: true } } } },
    },
  });
  if (!product || !product.active) notFound();

  const related = await prisma.product.findMany({
    where: { active: true, id: { not: product.id }, ...(product.categoryId ? { categoryId: product.categoryId } : {}) },
    include: { images: { take: 1 } },
    take: 4,
  });

  return <ProductDetail product={product} related={related} />;
}
