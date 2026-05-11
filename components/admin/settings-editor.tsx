'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SettingsEditor({ items }: { items: any[] }) {
  const groups = items.reduce<Record<string, any[]>>((acc, x) => {
    const g = x.group || 'misc'; (acc[g] = acc[g] || []).push(x); return acc;
  }, {});
  return (
    <div className="space-y-6">
      <NewSetting />
      {Object.entries(groups).map(([g, list]) => (
        <div key={g} className="glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-4">— {g.toUpperCase()}</h3>
          <div className="space-y-3">{list.map((it) => <Row key={it.key} it={it} />)}</div>
        </div>
      ))}
    </div>
  );
}

function NewSetting() {
  const router = useRouter();
  const t = useTranslations('admin.settings');
  const [d, setD] = useState({ key: '', value: '', group: 'general' });
  const add = async () => {
    if (!d.key) return;
    await fetch('/api/admin/settings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
    setD({ key: '', value: '', group: 'general' }); router.refresh();
  };
  return (
    <div className="glass p-4 grid grid-cols-12 gap-2">
      <input placeholder={t('key')} className="input col-span-4" value={d.key} onChange={(e) => setD({ ...d, key: e.target.value })} />
      <input placeholder={t('group')} className="input col-span-2" value={d.group} onChange={(e) => setD({ ...d, group: e.target.value })} />
      <input placeholder={t('value')} className="input col-span-5" value={d.value} onChange={(e) => setD({ ...d, value: e.target.value })} />
      <button onClick={add} className="btn-primary col-span-1"><Plus className="w-4 h-4" /></button>
    </div>
  );
}

function Row({ it }: any) {
  const router = useRouter();
  const [v, setV] = useState(it.value);
  const save = async () => {
    await fetch('/api/admin/settings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: it.key, value: v, group: it.group }) });
    router.refresh();
  };
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <code className="col-span-4 text-xs text-electric font-mono">{it.key}</code>
      <input className="input col-span-7" value={v} onChange={(e) => setV(e.target.value)} />
      <button onClick={save} className="btn-ghost col-span-1"><Save className="w-4 h-4" /></button>
    </div>
  );
}
