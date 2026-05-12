import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { NewArrivalsManager } from '@/components/admin/new-arrivals-manager';
import { getTranslations } from 'next-intl/server';

export default async function NewArrivalsAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.newArrivals');

  const settings = await prisma.setting.findMany({
    where: { key: { in: ['newArrivals.autoCount', 'newArrivals.heading_ar', 'newArrivals.heading_en'] } },
  });
  const settingMap = new Map(settings.map((s) => [s.key, s.value]));
  const autoCount = Number(settingMap.get('newArrivals.autoCount')) || 8;

  const featured = await prisma.featuredProduct.findMany({
    orderBy: { order: 'asc' },
    include: { product: { include: { images: { take: 1 } } } },
  });

  const latestProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: autoCount,
    include: { images: { take: 1 } },
  });

  const allActiveProducts = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, nameAr: true, nameEn: true, sku: true, slug: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted mt-3">{t('subtitle')}</p>
        </div>
      </header>
      <NewArrivalsManager
        featured={featured.map((f) => ({
          id: f.id,
          productId: f.productId,
          order: f.order,
          nameAr: f.product.nameAr,
          nameEn: f.product.nameEn,
          sku: f.product.sku,
          image: f.product.images[0]?.url || null,
        }))}
        latestProducts={latestProducts.map((p) => ({
          id: p.id,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          sku: p.sku,
          createdAt: p.createdAt.toISOString(),
          image: p.images[0]?.url || null,
        }))}
        allActiveProducts={allActiveProducts}
      />
    </div>
  );
}
