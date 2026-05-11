'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function AdminUserManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const t = useTranslations('admin.users');
  const tc = useTranslations('admin.common');
  const [d, setD] = useState({ email: '', name: '', password: '', role: 'admin' });
  const add = async () => {
    if (!d.email || !d.password || !d.name) return;
    const r = await fetch('/api/admin/users', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
    if (r.ok) { setD({ email: '', name: '', password: '', role: 'admin' }); router.refresh(); }
  };
  const del = async (id: string) => { if (!confirm(tc('confirmDelete'))) return; await fetch(`/api/admin/users/${id}`, { method: 'DELETE' }); router.refresh(); };
  return (
    <div className="space-y-4">
      <div className="glass p-4 grid grid-cols-12 gap-2">
        <input placeholder={t('placeholders.name')} className="input col-span-2" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
        <input placeholder={t('placeholders.email')} type="email" className="input col-span-3" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} />
        <input placeholder={t('placeholders.password')} type="password" className="input col-span-3" value={d.password} onChange={(e) => setD({ ...d, password: e.target.value })} />
        <select className="input col-span-3" value={d.role} onChange={(e) => setD({ ...d, role: e.target.value })}>
          <option>admin</option><option>superadmin</option><option>editor</option>
        </select>
        <button onClick={add} className="btn-primary col-span-1"><Plus className="w-4 h-4" /></button>
      </div>
      <div className="glass">
        {initial.map((u) => (
          <div key={u.id} className="grid grid-cols-12 gap-2 p-3 border-b border-line items-center">
            <span className="col-span-3">{u.name}</span>
            <span className="col-span-4 text-muted">{u.email}</span>
            <span className="col-span-3 text-xs uppercase tracking-cinematic text-electric">{u.role}</span>
            <span className="col-span-1 text-xs text-muted">{u.createdAt.toLocaleDateString()}</span>
            <button onClick={() => del(u.id)} className="col-span-1 btn-danger"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
