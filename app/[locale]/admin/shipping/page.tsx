import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ShippingManager } from '@/components/admin/shipping-manager';

export default async function ShippingAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const zones = await prisma.shippingZone.findMany({ orderBy: { order: 'asc' } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— STORE</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Shipping Zones</h1>
      <ShippingManager initial={zones} />
    </div>
  );
}
