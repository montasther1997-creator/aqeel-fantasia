'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/toast';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;
const PAYMENT = ['unpaid', 'paid', 'refunded'] as const;

export function OrderActions({ id, status, paymentStatus, trackingCode }: { id: string; status: string; paymentStatus: string; trackingCode: string }) {
  const router = useRouter();
  const t = useTranslations('admin.orderActions');
  const tc = useTranslations('admin.common');
  const [s, setS] = useState(status);
  const [ps, setPs] = useState(paymentStatus);
  const [track, setTrack] = useState(trackingCode);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: s, paymentStatus: ps, trackingCode: track }),
      });
      if (!res.ok) { toast('error', tc('updateFailed')); return; }
      toast('success', tc('saved'));
      router.refresh();
    } catch {
      toast('error', tc('updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label className="label">{t('status')}</label>
        <select className="input" value={s} onChange={(e) => setS(e.target.value)}>
          {STATUSES.map((x) => <option key={x} value={x}>{t(`statusOpts.${x}`)}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('payment')}</label>
        <select className="input" value={ps} onChange={(e) => setPs(e.target.value)}>
          {PAYMENT.map((x) => <option key={x} value={x}>{t(`paymentOpts.${x}`)}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="label">{t('tracking')}</label>
        <input className="input" value={track} onChange={(e) => setTrack(e.target.value)} placeholder={t('trackingPlaceholder')} />
        <p className="text-[10px] text-muted mt-1">{t('trackingHint')}</p>
      </div>
      <button onClick={save} disabled={saving} className="btn-primary">{saving ? '...' : t('update')}</button>
    </div>
  );
}
