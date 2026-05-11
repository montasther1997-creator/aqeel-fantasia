import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ShippingManager } from '@/components/admin/shipping-manager';
import { getTranslations } from 'next-intl/server';

export default async function ShippingAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.shipping');
  const [zones, settings] = await Promise.all([
    prisma.shippingZone.findMany({ orderBy: { order: 'asc' } }),
    prisma.setting.findMany({ where: { key: { in: ['shipping.freeThresholdIQD', 'shipping.codFeeIQD'] } } }),
  ]);
  const settingMap = new Map(settings.map((s) => [s.key, s.value]));
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-6">{t('title')}</h1>
      <ShippingManager
        initial={zones}
        settings={{
          freeThresholdIQD: Number(settingMap.get('shipping.freeThresholdIQD')) || 0,
          codFeeIQD: Number(settingMap.get('shipping.codFeeIQD')) || 0,
        }}
      />
    </div>
  );
}
