'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CategoryManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const t = useTranslations('admin.categories');
  const tc = useTranslations('admin.common');
  const [items, setItems] = useState(initial);
  const [creating, setCreating] = useState({ slug: '', nameAr: '', nameEn: '' });

  const add = async () => {
    if (!creating.slug || !creating.nameEn) return;
    const r = await fetch('/api/admin/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(creating) });
    if (r.ok) { setCreating({ slug: '', nameAr: '', nameEn: '' }); router.refresh(); }
  };
  const update = async (id: string, data: any) => {
    await fetch(`/api/admin/categories/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    router.refresh();
  };
  const del = async (id: string) => {
    if (!confirm(tc('confirmDelete'))) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    router.refresh();
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
        {items.map((c) => <CategoryRow key={c.id} c={c} update={update} del={del} onLabel={tc('on')} />)}
      </div>
    </div>
  );
}

function CategoryRow({ c, update, del, onLabel }: any) {
  const t = useTranslations('admin.categories');
  const [d, setD] = useState({ slug: c.slug, nameAr: c.nameAr, nameEn: c.nameEn, active: c.active });
  return (
    <div className="grid grid-cols-12 gap-2 p-3 items-center">
      <input className="input col-span-3" placeholder={t('placeholders.slug')} value={d.slug} onChange={(e) => setD({ ...d, slug: e.target.value })} />
      <input className="input col-span-3" placeholder={t('placeholders.nameEn')} value={d.nameEn} onChange={(e) => setD({ ...d, nameEn: e.target.value })} />
      <input className="input col-span-3" placeholder={t('placeholders.nameAr')} value={d.nameAr} onChange={(e) => setD({ ...d, nameAr: e.target.value })} />
      <label className="col-span-1 text-xs flex items-center gap-1"><input type="checkbox" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} /> {onLabel}</label>
      <button onClick={() => update(c.id, d)} className="col-span-1 btn-ghost"><Save className="w-4 h-4" /></button>
      <button onClick={() => del(c.id)} className="col-span-1 btn-danger"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}
