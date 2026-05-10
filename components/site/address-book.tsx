'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { IRAQ_GOVERNORATES_AR, IRAQ_GOVERNORATES_EN } from '@/lib/constants';
import { Plus, Trash2, Star, Edit2 } from 'lucide-react';

const empty = { recipient: '', country: 'Iraq', governorate: '', city: '', area: '', street: '', details: '', phone: '', isDefault: false };

export function AddressBook({ initial }: { initial: any[] }) {
  const router = useRouter();
  const locale = useLocale() as 'ar' | 'en';
  const govs = locale === 'ar' ? IRAQ_GOVERNORATES_AR : IRAQ_GOVERNORATES_EN;
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const url = editing ? `/api/account/addresses/${editing.id}` : '/api/account/addresses';
    const method = editing ? 'PATCH' : 'POST';
    await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
    setBusy(false); setForm(empty); setEditing(null); router.refresh();
  };

  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/account/addresses/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ isDefault: true }) });
    router.refresh();
  };

  const startEdit = (a: any) => { setEditing(a); setForm(a); };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        {initial.length === 0 && <p className="text-muted text-sm">No addresses yet.</p>}
        {initial.map((a) => (
          <div key={a.id} className="glass p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium flex items-center gap-2">{a.recipient} {a.isDefault && <Star className="w-3 h-3 text-electric fill-electric" />}</p>
                <p className="text-xs text-muted mt-1">{a.country}, {a.governorate} · {a.city} {a.area}</p>
                {a.street && <p className="text-xs text-muted">{a.street}</p>}
                <p className="text-xs text-muted font-mono mt-1">{a.phone}</p>
              </div>
              <div className="flex gap-1">
                {!a.isDefault && <button onClick={() => setDefault(a.id)} className="text-muted hover:text-electric" title="Set default"><Star className="w-4 h-4" /></button>}
                <button onClick={() => startEdit(a)} className="text-muted hover:text-frost"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => del(a.id)} className="text-muted hover:text-blood"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="glass-strong p-6 h-fit lg:sticky lg:top-24">
        <h3 className="text-xs tracking-cinematic text-muted mb-4">— {editing ? 'EDIT' : 'NEW ADDRESS'}</h3>
        <div className="space-y-3">
          <div><label className="label">Recipient</label><input className="input" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+964 ..." /></div>
          <div><label className="label">Governorate</label>
            <select className="input" value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}>
              <option value="">—</option>
              {govs.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div><label className="label">Area</label><input className="input" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
          <div><label className="label">Street</label><input className="input" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} /></div>
          <div><label className="label">Details</label><input className="input" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> Default</label>
          <div className="flex gap-2">
            <button disabled={busy} onClick={save} className="btn-primary flex-1"><Plus className="w-4 h-4" /> {editing ? 'Save' : 'Add'}</button>
            {editing && <button onClick={() => { setEditing(null); setForm(empty); }} className="btn-ghost">Cancel</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
