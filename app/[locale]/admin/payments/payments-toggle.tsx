'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';

export function PaymentsToggle({
  methodKey, name, initialEnabled, comingSoon,
}: { methodKey: string; name: string; initialEnabled: boolean; comingSoon?: boolean }) {
  const t = useTranslations('admin.payments');
  const tc = useTranslations('admin');
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const toggle = async () => {
    if (busy) return;
    const next = !enabled;
    setEnabled(next);
    setBusy(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: `payment.${methodKey}.enabled`, value: next ? '1' : '0', group: 'payments' }),
      });
      if (!res.ok) { setEnabled(!next); toast('error', tc('common.updateFailed')); return; }
      toast('success', next ? tc('common.activated') : tc('common.deactivated'));
      startTransition(() => router.refresh());
    } catch {
      setEnabled(!next);
      toast('error', tc('common.updateFailed'));
    } finally { setBusy(false); }
  };

  return (
    <div className="flex items-center justify-between p-3 border border-line">
      <div>
        <span>{name}</span>
        {comingSoon && <span className="ml-2 text-[10px] text-muted tracking-cinematic uppercase">{t('comingSoon')}</span>}
      </div>
      <button
        onClick={toggle}
        disabled={busy}
        className={`text-xs tracking-cinematic uppercase px-3 py-1.5 border transition-colors disabled:opacity-50 ${enabled ? 'border-electric text-electric' : 'border-line text-muted hover:text-frost'}`}
      >
        {enabled ? t('enabled') : t('disabled')}
      </button>
    </div>
  );
}
