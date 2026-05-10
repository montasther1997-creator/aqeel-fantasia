'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2 } from 'lucide-react';

export function ContentEditor({ items }: { items: any[] }) {
  const groups = items.reduce<Record<string, any[]>>((acc, x) => {
    const g = x.group || 'misc'; (acc[g] = acc[g] || []).push(x); return acc;
  }, {});
  return (
    <div className="space-y-6">
      <NewKey />
      {Object.entries(groups).map(([g, list]) => (
        <div key={g} className="glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-4">— {g.toUpperCase()}</h3>
          <div className="space-y-3">{list.map((it) => <Row key={it.id} it={it} />)}</div>
        </div>
      ))}
    </div>
  );
}

function NewKey() {
  const router = useRouter();
  const [d, setD] = useState({ key: '', valueEn: '', valueAr: '', group: 'general', type: 'text' });
  const add = async () => {
    if (!d.key) return;
    await fetch('/api/admin/content', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
    setD({ key: '', valueEn: '', valueAr: '', group: 'general', type: 'text' }); router.refresh();
  };
  return (
    <div className="glass p-4 grid grid-cols-12 gap-2 items-end">
      <input placeholder="key (e.g. gate.title)" className="input col-span-3" value={d.key} onChange={(e) => setD({ ...d, key: e.target.value })} />
      <input placeholder="group" className="input col-span-2" value={d.group} onChange={(e) => setD({ ...d, group: e.target.value })} />
      <input placeholder="value EN" className="input col-span-3" value={d.valueEn} onChange={(e) => setD({ ...d, valueEn: e.target.value })} />
      <input placeholder="value AR" className="input col-span-3" value={d.valueAr} onChange={(e) => setD({ ...d, valueAr: e.target.value })} />
      <button onClick={add} className="btn-primary col-span-1"><Plus className="w-4 h-4" /></button>
    </div>
  );
}

function Row({ it }: any) {
  const router = useRouter();
  const [v, setV] = useState({ valueEn: it.valueEn, valueAr: it.valueAr });
  const save = async () => { await fetch(`/api/admin/content/${it.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(v) }); router.refresh(); };
  const del = async () => { if (!confirm('Delete?')) return; await fetch(`/api/admin/content/${it.id}`, { method: 'DELETE' }); router.refresh(); };
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <code className="col-span-3 text-xs text-electric font-mono">{it.key}</code>
      <input className="input col-span-4" value={v.valueEn} onChange={(e) => setV({ ...v, valueEn: e.target.value })} />
      <input className="input col-span-4" value={v.valueAr} onChange={(e) => setV({ ...v, valueAr: e.target.value })} />
      <button onClick={save} className="btn-ghost col-span-1"><Save className="w-4 h-4" /></button>
    </div>
  );
}
