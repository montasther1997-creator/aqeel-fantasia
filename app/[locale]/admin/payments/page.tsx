import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { PaymentsToggle } from './payments-toggle';
import { getTranslations } from 'next-intl/server';

const METHODS = [
  { key: 'cod', defaultEnabled: true, comingSoon: false },
  { key: 'card', defaultEnabled: false, comingSoon: true },
  { key: 'bank', defaultEnabled: false, comingSoon: false },
  { key: 'zaincash', defaultEnabled: false, comingSoon: true },
];

export default async function Payments({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.payments');
  const settings = await prisma.setting.findMany({
    where: { key: { in: METHODS.map((m) => `payment.${m.key}.enabled`) } },
  });
  const settingMap = new Map(settings.map((s) => [s.key, s.value]));

  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-2">{t('title')}</h1>
      <p className="text-muted text-sm mb-6">{t('subtitle')}</p>
      <div className="glass p-6 space-y-4">
        {METHODS.map((m) => {
          const stored = settingMap.get(`payment.${m.key}.enabled`);
          const enabled = stored != null ? stored === '1' : m.defaultEnabled;
          return (
            <PaymentsToggle
              key={m.key}
              methodKey={m.key}
              name={t(`methods.${m.key}` as any)}
              initialEnabled={enabled}
              comingSoon={m.comingSoon}
            />
          );
        })}
      </div>
    </div>
  );
}
