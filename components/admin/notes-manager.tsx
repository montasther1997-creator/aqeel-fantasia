'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';

export function NotesManager({ initial, products }: { initial: any[]; products: any[] }) {
  const router = useRouter();
  const [d, setD] = useState({ number: '', textAr: '', textEn: '', noteDate: '', productId: '', signature: 'ع. / A.' });

  const add = async () => {
    if (!d.textAr || !d.textEn || !d.number) return;
    await fetch('/api/admin/notes', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...d, number: parseInt(d.number), productId: d.productId || null }),
    });
    setD({ number: '', textAr: '', textEn: '', noteDate: '', productId: '', signature: 'ع. / A.' });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* New note form */}
      <div className="glass p-6 space-y-4">
        <h3 className="text-xs tracking-cinematic text-muted">— NEW NOTE</h3>
        <div className="grid grid-cols-12 gap-3">
          <input type="number" placeholder="N°" className="input col-span-1" value={d.number} onChange={(e) => setD({ ...d, number: e.target.value })} />
          <input type="date" className="input col-span-3" value={d.noteDate} onChange={(e) => setD({ ...d, noteDate: e.target.value })} />
          <input placeholder="Signature" className="input col-span-2" value={d.signature} onChange={(e) => setD({ ...d, signature: e.target.value })} />
          <select className="input col-span-6" value={d.productId} onChange={(e) => setD({ ...d, productId: e.target.value })}>
            <option value="">— linked product (optional) —</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
          </select>
        </div>
        <textarea placeholder="نص ع: «...»" dir="rtl" className="input min-h-[80px]" value={d.textAr} onChange={(e) => setD({ ...d, textAr: e.target.value })} />
        <textarea placeholder='English text: "..."' className="input min-h-[80px]" value={d.textEn} onChange={(e) => setD({ ...d, textEn: e.target.value })} />
        <button onClick={add} className="btn-primary"><Plus className="w-4 h-4" /> Add Note</button>
      </div>

      {/* Existing notes */}
      <div className="space-y-3">
        {initial.map((n) => <NoteRow key={n.id} n={n} products={products} />)}
      </div>
    </div>
  );
}

function NoteRow({ n, products }: { n: any; products: any[] }) {
  const router = useRouter();
  const [d, setD] = useState({
    textAr: n.textAr, textEn: n.textEn, number: n.number,
    productId: n.productId || '', signature: n.signature || '', active: n.active,
    noteDate: n.noteDate ? new Date(n.noteDate).toISOString().slice(0, 10) : '',
  });

  const save = async () => {
    await fetch(`/api/admin/notes/${n.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...d, productId: d.productId || null }) });
    router.refresh();
  };
  const del = async () => { if (!confirm('Delete?')) return; await fetch(`/api/admin/notes/${n.id}`, { method: 'DELETE' }); router.refresh(); };

  return (
    <div className="glass p-4 space-y-3">
      <div className="grid grid-cols-12 gap-2 items-center">
        <input type="number" className="input col-span-1" value={d.number} onChange={(e) => setD({ ...d, number: parseInt(e.target.value) })} />
        <input type="date" className="input col-span-2" value={d.noteDate} onChange={(e) => setD({ ...d, noteDate: e.target.value })} />
        <input placeholder="Signature" className="input col-span-2" value={d.signature} onChange={(e) => setD({ ...d, signature: e.target.value })} />
        <select className="input col-span-5" value={d.productId} onChange={(e) => setD({ ...d, productId: e.target.value })}>
          <option value="">—</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
        </select>
        <label className="col-span-1 text-xs flex items-center gap-1"><input type="checkbox" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} /> on</label>
        <button onClick={save} className="col-span-1 btn-ghost text-xs"><Save className="w-3 h-3" /></button>
      </div>
      <textarea dir="rtl" className="input min-h-[60px]" value={d.textAr} onChange={(e) => setD({ ...d, textAr: e.target.value })} />
      <textarea className="input min-h-[60px]" value={d.textEn} onChange={(e) => setD({ ...d, textEn: e.target.value })} />
      <button onClick={del} className="text-xs text-blood flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
    </div>
  );
}
