'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function CustomerActions({ id, vipTier, blocked, notes }: { id: string; vipTier: string; blocked: boolean; notes: string }) {
  const router = useRouter();
  const t = useTranslations('admin.customerActions');
  const [v, setV] = useState(vipTier);
  const [b, setB] = useState(blocked);
  const [n, setN] = useState(notes);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/customers/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ vipTier: v, blocked: b, notes: n }),
    });
    setSaving(false); router.refresh();
  };

  return (
    <div className="glass p-4 flex flex-wrap gap-3 items-end">
      <div><label className="label">{t('vipTier')}</label><select className="input" value={v} onChange={(e) => setV(e.target.value)}>{['none','bronze','silver','gold','black'].map((x) => <option key={x}>{x}</option>)}</select></div>
      <div><label className="label">{t('blocked')}</label><select className="input" value={b ? '1' : '0'} onChange={(e) => setB(e.target.value === '1')}><option value="0">{t('no')}</option><option value="1">{t('yes')}</option></select></div>
      <div className="flex-1 min-w-[300px]"><label className="label">{t('notes')}</label><input className="input" value={n} onChange={(e) => setN(e.target.value)} /></div>
      <button onClick={save} disabled={saving} className="btn-primary">{saving ? '...' : t('save')}</button>
    </div>
  );
}
