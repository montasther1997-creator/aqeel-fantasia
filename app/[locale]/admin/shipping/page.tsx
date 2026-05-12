import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ShippingManager } from '@/components/admin/shipping-manager';
import { getTranslations } from 'next-intl/server';

export default async function ShippingAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.shipping');
  const zones = await prisma.shippingZone.findMany({ orderBy: { order: 'asc' } });
  const settings = await prisma.setting.findMany({ where: { key: { in: ['shipping.freeThresholdIQD', 'shipping.codFeeIQD'] } } });
  const settingMap = new Map(settings.map((s) => [s.key, s.value]));
  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted num mt-3">{zones.length}</p>
        </div>
      </header>
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
