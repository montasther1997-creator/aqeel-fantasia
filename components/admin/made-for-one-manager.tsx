'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function MadeForOneManager({ initial, products, customers }: { initial: any[]; products: any[]; customers: any[] }) {
  const router = useRouter();
  const t = useTranslations('admin.madeForOne');
  const [d, setD] = useState({ productId: '', customerId: '', edition: '', personalNote: '' });

  const add = async () => {
    if (!d.productId) return;
    await fetch('/api/admin/made-for-one', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(d),
    });
    setD({ productId: '', customerId: '', edition: '', personalNote: '' });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 space-y-3">
        <h3 className="text-xs tracking-cinematic text-muted">— {t('reserveTitle')}</h3>
        <div className="grid grid-cols-12 gap-2">
          <select className="input col-span-5" value={d.productId} onChange={(e) => setD({ ...d, productId: e.target.value })}>
            <option value="">{t('selectProduct')}</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
          </select>
          <select className="input col-span-4" value={d.customerId} onChange={(e) => setD({ ...d, customerId: e.target.value })}>
            <option value="">{t('selectCustomer')}</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
          </select>
          <input placeholder={t('editionPlaceholder')} className="input col-span-3" value={d.edition} onChange={(e) => setD({ ...d, edition: e.target.value })} />
        </div>
        <textarea placeholder={t('personalNotePlaceholder')} className="input min-h-[60px]" value={d.personalNote} onChange={(e) => setD({ ...d, personalNote: e.target.value })} />
        <button onClick={add} className="btn-primary"><Plus className="w-4 h-4" /> {t('reserve')}</button>
      </div>

      <div className="space-y-3">
        {initial.map((m) => <Row key={m.id} m={m} customers={customers} />)}
        {initial.length === 0 && <p className="text-muted text-sm">{t('empty')}</p>}
      </div>
    </div>
  );
}

function Row({ m, customers }: { m: any; customers: any[] }) {
  const router = useRouter();
  const t = useTranslations('admin.madeForOne');
  const [d, setD] = useState({ customerId: m.customerId || '', edition: m.edition || '', personalNote: m.personalNote || '', status: m.status });

  const save = async () => {
    await fetch(`/api/admin/made-for-one/${m.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...d, customerId: d.customerId || null }) });
    router.refresh();
  };
  const del = async () => { if (!confirm(t('confirmRemove'))) return; await fetch(`/api/admin/made-for-one/${m.id}`, { method: 'DELETE' }); router.refresh(); };

  return (
    <div className="glass p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm">{m.product.nameEn}</p>
        <span className="text-[10px] tracking-cinematic uppercase text-electric">{t(`status.${m.status}` as any)}</span>
      </div>
      <div className="grid grid-cols-12 gap-2">
        <select className="input col-span-5" value={d.customerId} onChange={(e) => setD({ ...d, customerId: e.target.value })}>
          <option value="">{t('unassigned')}</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
        </select>
        <input placeholder={t('edition')} className="input col-span-3" value={d.edition} onChange={(e) => setD({ ...d, edition: e.target.value })} />
        <select className="input col-span-2" value={d.status} onChange={(e) => setD({ ...d, status: e.target.value })}>
          <option value="available">{t('status.available')}</option>
          <option value="reserved">{t('status.reserved')}</option>
          <option value="claimed">{t('status.claimed')}</option>
        </select>
        <button onClick={save} className="col-span-1 btn-ghost"><Save className="w-4 h-4" /></button>
        <button onClick={del} className="col-span-1 btn-danger"><Trash2 className="w-4 h-4" /></button>
      </div>
      <textarea className="input min-h-[50px] text-xs" value={d.personalNote} onChange={(e) => setD({ ...d, personalNote: e.target.value })} />
    </div>
  );
}
