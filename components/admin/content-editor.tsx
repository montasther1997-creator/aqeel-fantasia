'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from '@/components/ui/toast';

const GROUP_LABELS: Record<string, { ar: string; en: string }> = {
  about: { ar: 'الدار', en: 'About' },
  gate: { ar: 'الواجهة', en: 'Gate' },
  cult: { ar: 'النادي الحصري', en: 'Cult' },
  archive: { ar: 'الأرشيف', en: 'Archive' },
  bespoke: { ar: 'التفصيل', en: 'Bespoke' },
  footer: { ar: 'التذييل', en: 'Footer' },
  home: { ar: 'الرئيسية', en: 'Home' },
  general: { ar: 'عام', en: 'General' },
  misc: { ar: 'متفرّقات', en: 'Misc' },
};

function groupLabel(slug: string, locale: string): string {
  const known = GROUP_LABELS[slug.toLowerCase()];
  if (known) return locale === 'ar' ? known.ar : known.en;
  return slug;
}

export function ContentEditor({ items }: { items: any[] }) {
  const locale = useLocale();
  const t = useTranslations('admin.content');
  const groups = items.reduce<Record<string, any[]>>((acc, x) => {
    const g = x.group || 'misc';
    (acc[g] = acc[g] || []).push(x);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <NewKey />
      {Object.keys(groups).length === 0 ? (
        <div className="glass p-12 text-center text-muted">
          <p>{t('empty')}</p>
        </div>
      ) : Object.entries(groups).map(([g, list]) => (
        <div key={g} className="glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-1">— {groupLabel(g, locale)}</h3>
          <p className="text-[10px] text-muted opacity-60 font-mono mb-4">{g}</p>
          <div className="space-y-3">{list.map((it) => <Row key={it.id} it={it} />)}</div>
        </div>
      ))}
    </div>
  );
}

function NewKey() {
  const router = useRouter();
  const t = useTranslations('admin.content');
  const tc = useTranslations('admin.common');
  const [d, setD] = useState({ key: '', valueEn: '', valueAr: '', group: '', type: 'text' });
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!d.key.trim()) {
      toast('error', t('keyRequired'));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...d, group: d.group.trim() || 'general' }),
      });
      if (!res.ok) { toast('error', tc('createFailed')); return; }
      toast('success', tc('created'));
      setD({ key: '', valueEn: '', valueAr: '', group: '', type: 'text' });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass p-5 space-y-3">
      <h3 className="text-xs tracking-cinematic text-muted">{t('addNew')}</h3>
      <div className="grid sm:grid-cols-12 gap-3">
        <div className="sm:col-span-4">
          <label className="text-[10px] tracking-cinematic text-muted block mb-1">{t('keyLabel')}</label>
          <input className="input font-mono text-xs" placeholder={t('keyPlaceholder')} value={d.key} onChange={(e) => setD({ ...d, key: e.target.value })} />
        </div>
        <div className="sm:col-span-3">
          <label className="text-[10px] tracking-cinematic text-muted block mb-1">{t('groupLabel')}</label>
          <input className="input font-mono text-xs" placeholder={t('groupPlaceholder')} value={d.group} onChange={(e) => setD({ ...d, group: e.target.value })} />
        </div>
        <div className="sm:col-span-4">
          <label className="text-[10px] tracking-cinematic text-muted block mb-1">{t('valueEnLabel')}</label>
          <input className="input" placeholder={t('valueEnPlaceholder')} value={d.valueEn} onChange={(e) => setD({ ...d, valueEn: e.target.value })} />
        </div>
        <div className="sm:col-span-1 flex items-end">
          <button onClick={add} disabled={busy} className="btn-primary w-full inline-flex items-center justify-center disabled:opacity-50">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="sm:col-span-12">
          <label className="text-[10px] tracking-cinematic text-muted block mb-1">{t('valueArLabel')}</label>
          <input className="input" placeholder={t('valueArPlaceholder')} value={d.valueAr} onChange={(e) => setD({ ...d, valueAr: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function Row({ it }: any) {
  const router = useRouter();
  const t = useTranslations('admin.content');
  const tc = useTranslations('admin.common');
  const [v, setV] = useState({ valueEn: it.valueEn, valueAr: it.valueAr });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/content/${it.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(v),
      });
      if (!res.ok) { toast('error', tc('updateFailed')); return; }
      toast('success', tc('saved'));
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    if (!confirm(t('confirmDelete'))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/content/${it.id}`, { method: 'DELETE' });
      if (!res.ok) { toast('error', tc('deleteFailed')); return; }
      toast('success', tc('deleted'));
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <code className="col-span-3 text-xs text-electric font-mono">{it.key}</code>
      <input className="input col-span-4" value={v.valueEn} dir="ltr" onChange={(e) => setV({ ...v, valueEn: e.target.value })} />
      <input className="input col-span-3" value={v.valueAr} dir="rtl" onChange={(e) => setV({ ...v, valueAr: e.target.value })} />
      <button onClick={save} disabled={busy} className="btn-ghost col-span-1 disabled:opacity-50" aria-label={tc('save')}>
        <Save className="w-4 h-4" />
      </button>
      <button onClick={del} disabled={busy} className="col-span-1 text-muted hover:text-blood transition-colors disabled:opacity-50" aria-label={tc('delete')}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
