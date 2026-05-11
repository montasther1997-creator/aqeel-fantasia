'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DiscountManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const t = useTranslations('admin.discounts');
  const tc = useTranslations('admin.common');
  const [d, setD] = useState({ code: '', type: 'percent', value: 10 });
  const add = async () => {
    if (!d.code) return;
    await fetch('/api/admin/discounts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
    setD({ code: '', type: 'percent', value: 10 }); router.refresh();
  };
  const del = async (id: string) => { if (!confirm(tc('confirmDelete'))) return; await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' }); router.refresh(); };
  return (
    <div className="space-y-4">
      <div className="glass p-4 grid grid-cols-12 gap-2">
        <input placeholder={t('code')} className="input col-span-4 uppercase" value={d.code} onChange={(e) => setD({ ...d, code: e.target.value.toUpperCase() })} />
        <select className="input col-span-3" value={d.type} onChange={(e) => setD({ ...d, type: e.target.value })}>
          <option value="percent">{t('percent')}</option>
          <option value="fixed">{t('fixed')}</option>
        </select>
        <input type="number" className="input col-span-4" value={d.value} onChange={(e) => setD({ ...d, value: +e.target.value })} />
        <button onClick={add} className="btn-primary col-span-1"><Plus className="w-4 h-4" /></button>
      </div>
      <div className="glass">
        {initial.map((x) => (
          <div key={x.id} className="grid grid-cols-12 gap-2 p-3 border-b border-line items-center">
            <span className="col-span-3 font-mono text-electric">{x.code}</span>
            <span className="col-span-3 text-xs text-muted uppercase">{x.type}</span>
            <span className="col-span-3">{x.value}{x.type === 'percent' ? '%' : ''}</span>
            <span className="col-span-2 text-xs text-muted">{x.usedCount}/{x.maxUses ?? '∞'}</span>
            <button onClick={() => del(x.id)} className="col-span-1 btn-danger"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
