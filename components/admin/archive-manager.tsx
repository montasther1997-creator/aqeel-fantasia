'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ArchiveManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const t = useTranslations('admin.archive');
  const [d, setD] = useState({ titleEn: '', titleAr: '', type: 'photo', cover: '' });
  const add = async () => {
    if (!d.titleEn || !d.cover) return;
    await fetch('/api/admin/archive', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
    setD({ titleEn: '', titleAr: '', type: 'photo', cover: '' }); router.refresh();
  };
  return (
    <div className="space-y-4">
      <div className="glass p-4 grid grid-cols-12 gap-2">
        <input placeholder={t('placeholders.titleEn')} className="input col-span-3" value={d.titleEn} onChange={(e) => setD({ ...d, titleEn: e.target.value })} />
        <input placeholder={t('placeholders.titleAr')} className="input col-span-3" value={d.titleAr} onChange={(e) => setD({ ...d, titleAr: e.target.value })} />
        <select className="input col-span-2" value={d.type} onChange={(e) => setD({ ...d, type: e.target.value })}>
          {['photo', 'reel', 'edit', 'campaign'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <input placeholder={t('placeholders.coverUrl')} className="input col-span-3" value={d.cover} onChange={(e) => setD({ ...d, cover: e.target.value })} />
        <button onClick={add} className="btn-primary col-span-1"><Plus className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {initial.map((it) => <Card key={it.id} it={it} />)}
      </div>
    </div>
  );
}

function Card({ it }: any) {
  const router = useRouter();
  const t = useTranslations('admin.archive');
  const tc = useTranslations('admin.common');
  const del = async () => { if (!confirm(tc('confirmDelete'))) return; await fetch(`/api/admin/archive/${it.id}`, { method: 'DELETE' }); router.refresh(); };
  return (
    <div className="glass overflow-hidden">
      <div className="aspect-square bg-bg-secondary"><img src={it.cover} className="w-full h-full object-cover" /></div>
      <div className="p-3">
        <p className="text-[10px] uppercase text-electric tracking-cinematic">{it.type}</p>
        <p className="text-sm">{it.titleEn}</p>
        <p className="text-xs text-muted">{it.titleAr}</p>
        <button onClick={del} className="mt-2 text-blood text-xs flex items-center gap-1"><Trash2 className="w-3 h-3" /> {t('delete')}</button>
      </div>
    </div>
  );
}
