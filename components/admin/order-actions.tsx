'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT = ['unpaid', 'paid', 'refunded'];

export function OrderActions({ id, status, paymentStatus, trackingCode }: { id: string; status: string; paymentStatus: string; trackingCode: string }) {
  const router = useRouter();
  const t = useTranslations('admin.orderActions');
  const [s, setS] = useState(status);
  const [ps, setPs] = useState(paymentStatus);
  const [tc, setTc] = useState(trackingCode);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: s, paymentStatus: ps, trackingCode: tc }),
    });
    setSaving(false);
    router.refresh();
  };

  return (
    <div className="glass p-4 flex flex-wrap gap-3 items-end">
      <div><label className="label">{t('status')}</label><select className="input" value={s} onChange={(e) => setS(e.target.value)}>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div>
      <div><label className="label">{t('payment')}</label><select className="input" value={ps} onChange={(e) => setPs(e.target.value)}>{PAYMENT.map((x) => <option key={x}>{x}</option>)}</select></div>
      <div className="flex-1 min-w-[200px]"><label className="label">{t('tracking')}</label><input className="input" value={tc} onChange={(e) => setTc(e.target.value)} /></div>
      <button onClick={save} disabled={saving} className="btn-primary">{saving ? '...' : t('update')}</button>
    </div>
  );
}
