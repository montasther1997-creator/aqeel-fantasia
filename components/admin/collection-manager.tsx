'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CollectionManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const t = useTranslations('admin.collections');
  const [creating, setCreating] = useState({ slug: '', nameEn: '', nameAr: '' });
  const add = async () => {
    if (!creating.slug || !creating.nameEn) return;
    await fetch('/api/admin/collections', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(creating) });
    setCreating({ slug: '', nameEn: '', nameAr: '' }); router.refresh();
  };
  return (
    <div className="space-y-4">
      <div className="glass p-4 grid grid-cols-12 gap-2 items-end">
        <input placeholder={t('placeholders.slug')} className="input col-span-3" value={creating.slug} onChange={(e) => setCreating({ ...creating, slug: e.target.value })} />
        <input placeholder={t('placeholders.nameEn')} className="input col-span-4" value={creating.nameEn} onChange={(e) => setCreating({ ...creating, nameEn: e.target.value })} />
        <input placeholder={t('placeholders.nameAr')} className="input col-span-4" value={creating.nameAr} onChange={(e) => setCreating({ ...creating, nameAr: e.target.value })} />
        <button onClick={add} className="btn-primary col-span-1"><Plus className="w-4 h-4" /></button>
      </div>
      <div className="glass divide-y divide-line">
        {initial.map((c) => <Row key={c.id} c={c} />)}
      </div>
    </div>
  );
}

function Row({ c }: any) {
  const router = useRouter();
  const t = useTranslations('admin.collections');
  const tc = useTranslations('admin.common');
  const [d, setD] = useState({ slug: c.slug, nameEn: c.nameEn, nameAr: c.nameAr, featured: c.featured, active: c.active });
  const save = async () => { await fetch(`/api/admin/collections/${c.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) }); router.refresh(); };
  const del = async () => { if (!confirm(tc('confirmDelete'))) return; await fetch(`/api/admin/collections/${c.id}`, { method: 'DELETE' }); router.refresh(); };
  return (
    <div className="grid grid-cols-12 gap-2 p-3 items-center">
      <input className="input col-span-2" placeholder={t('placeholders.slug')} value={d.slug} onChange={(e) => setD({ ...d, slug: e.target.value })} />
      <input className="input col-span-3" placeholder={t('placeholders.nameEn')} value={d.nameEn} onChange={(e) => setD({ ...d, nameEn: e.target.value })} />
      <input className="input col-span-3" placeholder={t('placeholders.nameAr')} value={d.nameAr} onChange={(e) => setD({ ...d, nameAr: e.target.value })} />
      <span className="col-span-1 text-xs text-muted">{t('productsCount', { count: c._count?.products ?? 0 })}</span>
      <label className="col-span-1 text-xs flex items-center gap-1"><input type="checkbox" checked={d.featured} onChange={(e) => setD({ ...d, featured: e.target.checked })} /> ★</label>
      <button onClick={save} className="col-span-1 btn-ghost"><Save className="w-4 h-4" /></button>
      <button onClick={del} className="col-span-1 btn-danger"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}
