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
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <p className="ed-eye mb-3">— {t('eyebrow')}</p>
          <h1 className="ed-title text-5xl md:text-6xl">{t('title')}</h1>
          <p className="ed-caption text-muted mt-3">{t('subtitle')}</p>
        </div>
      </header>
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
