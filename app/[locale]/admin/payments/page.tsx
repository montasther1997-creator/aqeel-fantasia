import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { PaymentsToggle } from './payments-toggle';

const METHODS = [
  { key: 'cod', name: 'Cash on Delivery (COD)', defaultEnabled: true, comingSoon: false },
  { key: 'card', name: 'Credit / Debit Card', defaultEnabled: false, comingSoon: true },
  { key: 'bank', name: 'Bank Transfer', defaultEnabled: false, comingSoon: false },
  { key: 'zaincash', name: 'ZainCash', defaultEnabled: false, comingSoon: true },
];

export default async function Payments({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const settings = await prisma.setting.findMany({
    where: { key: { in: METHODS.map((m) => `payment.${m.key}.enabled`) } },
  });
  const settingMap = new Map(settings.map((s) => [s.key, s.value]));

  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— STORE</p>
      <h1 className="h-display text-4xl mt-2 mb-2">Payments</h1>
      <p className="text-muted text-sm mb-6">Enable or disable payment methods shown at checkout.</p>
      <div className="glass p-6 space-y-4">
        {METHODS.map((m) => {
          const stored = settingMap.get(`payment.${m.key}.enabled`);
          const enabled = stored != null ? stored === '1' : m.defaultEnabled;
          return (
            <PaymentsToggle
              key={m.key}
              methodKey={m.key}
              name={m.name}
              initialEnabled={enabled}
              comingSoon={m.comingSoon}
            />
          );
        })}
      </div>
    </div>
  );
}
