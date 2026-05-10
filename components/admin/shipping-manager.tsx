'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';

export function ShippingManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const [d, setD] = useState({ nameEn: '', nameAr: '', governorates: '', priceIQD: 0, priceUSD: 0, etaDays: '' });
  const add = async () => {
    if (!d.nameEn) return;
    const govs = JSON.stringify(d.governorates.split(',').map((g) => g.trim()).filter(Boolean));
    await fetch('/api/admin/shipping', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...d, governorates: govs }) });
    setD({ nameEn: '', nameAr: '', governorates: '', priceIQD: 0, priceUSD: 0, etaDays: '' });
    router.refresh();
  };
  return (
    <div className="space-y-4">
      <div className="glass p-4 grid grid-cols-12 gap-2">
        <input placeholder="Name EN" className="input col-span-2" value={d.nameEn} onChange={(e) => setD({ ...d, nameEn: e.target.value })} />
        <input placeholder="Name AR" className="input col-span-2" value={d.nameAr} onChange={(e) => setD({ ...d, nameAr: e.target.value })} />
        <input placeholder="Governorates (comma)" className="input col-span-3" value={d.governorates} onChange={(e) => setD({ ...d, governorates: e.target.value })} />
        <input type="number" placeholder="IQD" className="input col-span-1" value={d.priceIQD} onChange={(e) => setD({ ...d, priceIQD: +e.target.value })} />
        <input type="number" placeholder="USD" className="input col-span-1" value={d.priceUSD} onChange={(e) => setD({ ...d, priceUSD: +e.target.value })} />
        <input placeholder="ETA (2-4)" className="input col-span-2" value={d.etaDays} onChange={(e) => setD({ ...d, etaDays: e.target.value })} />
        <button onClick={add} className="btn-primary col-span-1"><Plus className="w-4 h-4" /></button>
      </div>
      <div className="glass divide-y divide-line">
        {initial.map((z) => <Row key={z.id} z={z} />)}
      </div>
    </div>
  );
}

function Row({ z }: any) {
  const router = useRouter();
  let initialGovs = ''; try { initialGovs = (JSON.parse(z.governorates) as string[]).join(', '); } catch {}
  const [d, setD] = useState({ nameEn: z.nameEn, nameAr: z.nameAr, governorates: initialGovs, priceIQD: z.priceIQD, priceUSD: z.priceUSD, etaDays: z.etaDays || '', active: z.active });
  const save = async () => {
    const govs = JSON.stringify(d.governorates.split(',').map((g: string) => g.trim()).filter(Boolean));
    await fetch(`/api/admin/shipping/${z.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...d, governorates: govs }) });
    router.refresh();
  };
  const del = async () => { if (!confirm('Delete?')) return; await fetch(`/api/admin/shipping/${z.id}`, { method: 'DELETE' }); router.refresh(); };
  return (
    <div className="grid grid-cols-12 gap-2 p-3 items-center">
      <input className="input col-span-2" value={d.nameEn} onChange={(e) => setD({ ...d, nameEn: e.target.value })} />
      <input className="input col-span-2" value={d.nameAr} onChange={(e) => setD({ ...d, nameAr: e.target.value })} />
      <input className="input col-span-3" value={d.governorates} onChange={(e) => setD({ ...d, governorates: e.target.value })} />
      <input type="number" className="input col-span-1" value={d.priceIQD} onChange={(e) => setD({ ...d, priceIQD: +e.target.value })} />
      <input type="number" className="input col-span-1" value={d.priceUSD} onChange={(e) => setD({ ...d, priceUSD: +e.target.value })} />
      <input className="input col-span-1" value={d.etaDays} onChange={(e) => setD({ ...d, etaDays: e.target.value })} />
      <button onClick={save} className="col-span-1 btn-ghost"><Save className="w-4 h-4" /></button>
      <button onClick={del} className="col-span-1 btn-danger"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}
