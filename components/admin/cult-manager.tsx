'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';

export function CultManager({ tiers, members }: { tiers: any[]; members: any[] }) {
  const router = useRouter();
  const [d, setD] = useState({ slug: '', nameEn: '', nameAr: '', priceIQD: 0, priceUSD: 0, color: '#C0C0C8', perks: '' });
  const add = async () => {
    if (!d.slug || !d.nameEn) return;
    const perks = JSON.stringify(d.perks.split(',').map((p) => p.trim()).filter(Boolean));
    await fetch('/api/admin/cult', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...d, perks }) });
    setD({ slug: '', nameEn: '', nameAr: '', priceIQD: 0, priceUSD: 0, color: '#C0C0C8', perks: '' });
    router.refresh();
  };
  return (
    <div className="space-y-6">
      <div className="glass p-4 grid grid-cols-12 gap-2">
        <input placeholder="slug" className="input col-span-2" value={d.slug} onChange={(e) => setD({ ...d, slug: e.target.value })} />
        <input placeholder="Name EN" className="input col-span-2" value={d.nameEn} onChange={(e) => setD({ ...d, nameEn: e.target.value })} />
        <input placeholder="Name AR" className="input col-span-2" value={d.nameAr} onChange={(e) => setD({ ...d, nameAr: e.target.value })} />
        <input type="number" placeholder="IQD" className="input col-span-1" value={d.priceIQD} onChange={(e) => setD({ ...d, priceIQD: +e.target.value })} />
        <input type="number" placeholder="USD" className="input col-span-1" value={d.priceUSD} onChange={(e) => setD({ ...d, priceUSD: +e.target.value })} />
        <input type="color" className="input col-span-1 p-1" value={d.color} onChange={(e) => setD({ ...d, color: e.target.value })} />
        <input placeholder="perks comma,separated" className="input col-span-2" value={d.perks} onChange={(e) => setD({ ...d, perks: e.target.value })} />
        <button onClick={add} className="btn-primary col-span-1"><Plus className="w-4 h-4" /></button>
      </div>
      <div className="glass divide-y divide-line">
        {tiers.map((t) => <TierRow key={t.id} t={t} />)}
      </div>
      <div className="glass p-6">
        <h3 className="text-xs tracking-cinematic text-muted mb-4">— MEMBERS ({members.length})</h3>
        {members.length === 0 ? <p className="text-muted text-sm">No members yet.</p> :
          members.map((m) => (
            <div key={m.id} className="flex justify-between py-2 border-b border-line text-sm">
              <span>{m.customer.name}</span>
              <span className="uppercase text-electric text-xs tracking-cinematic">{m.tier.nameEn}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function TierRow({ t }: any) {
  const router = useRouter();
  const [d, setD] = useState({ slug: t.slug, nameEn: t.nameEn, nameAr: t.nameAr, priceIQD: t.priceIQD, priceUSD: t.priceUSD, color: t.color || '#fff', active: t.active });
  const save = async () => { await fetch(`/api/admin/cult/${t.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) }); router.refresh(); };
  const del = async () => { if (!confirm('Delete?')) return; await fetch(`/api/admin/cult/${t.id}`, { method: 'DELETE' }); router.refresh(); };
  return (
    <div className="grid grid-cols-12 gap-2 p-3 items-center">
      <input className="input col-span-2" value={d.slug} onChange={(e) => setD({ ...d, slug: e.target.value })} />
      <input className="input col-span-2" value={d.nameEn} onChange={(e) => setD({ ...d, nameEn: e.target.value })} />
      <input className="input col-span-2" value={d.nameAr} onChange={(e) => setD({ ...d, nameAr: e.target.value })} />
      <input type="number" className="input col-span-1" value={d.priceIQD} onChange={(e) => setD({ ...d, priceIQD: +e.target.value })} />
      <input type="number" className="input col-span-1" value={d.priceUSD} onChange={(e) => setD({ ...d, priceUSD: +e.target.value })} />
      <input type="color" className="input col-span-1 p-1" value={d.color} onChange={(e) => setD({ ...d, color: e.target.value })} />
      <label className="col-span-1 text-xs flex items-center gap-1"><input type="checkbox" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} /> on</label>
      <button onClick={save} className="col-span-1 btn-ghost"><Save className="w-4 h-4" /></button>
      <button onClick={del} className="col-span-1 btn-danger"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}
