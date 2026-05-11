'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, AlertTriangle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from '@/components/ui/toast';

const GROUP_LABELS: Record<string, { ar: string; en: string }> = {
  about: { ar: 'الدار', en: 'About' },
  branches: { ar: 'الفروع', en: 'Branches' },
  branch: { ar: 'الفروع', en: 'Branches' },
  social: { ar: 'التواصل الاجتماعي', en: 'Social' },
  shipping: { ar: 'الشحن', en: 'Shipping' },
  loyalty: { ar: 'الولاء', en: 'Loyalty' },
  payments: { ar: 'المدفوعات', en: 'Payments' },
  appearance: { ar: 'المظهر', en: 'Appearance' },
  gate: { ar: 'الواجهة', en: 'Gate' },
  cult: { ar: 'النادي الحصري', en: 'Cult' },
  bespoke: { ar: 'التفصيل', en: 'Bespoke' },
  archive: { ar: 'الأرشيف', en: 'Archive' },
  home: { ar: 'الرئيسية', en: 'Home' },
  footer: { ar: 'التذييل', en: 'Footer' },
  general: { ar: 'عام', en: 'General' },
  misc: { ar: 'متفرّقات', en: 'Misc' },
};

function groupLabel(slug: string, locale: string): string {
  // Normalize keys like "branch.1" -> "branch"
  const root = slug.split('.')[0].toLowerCase();
  const known = GROUP_LABELS[root];
  if (known) return locale === 'ar' ? known.ar : known.en;
  return slug;
}

export function SettingsEditor({ items }: { items: any[] }) {
  const locale = useLocale();
  const t = useTranslations('admin.settings');
  const groups = items.reduce<Record<string, any[]>>((acc, x) => {
    const g = x.group || 'misc';
    (acc[g] = acc[g] || []).push(x);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="glass-strong border-l-2 border-burgundy p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-burgundy shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm text-frost">{t('advancedWarning.title')}</p>
          <p className="text-xs text-muted">{t('advancedWarning.body')}</p>
        </div>
      </div>

      <NewSetting />

      {Object.keys(groups).length === 0 ? (
        <p className="text-muted text-sm text-center py-8">{t('emptyAdvanced')}</p>
      ) : Object.entries(groups).map(([g, list]) => (
        <div key={g} className="glass p-6">
          <h3 className="text-xs tracking-cinematic text-muted mb-1">— {groupLabel(g, locale)}</h3>
          <p className="text-[10px] text-muted opacity-60 font-mono mb-4">{g}</p>
          <div className="space-y-3">{list.map((it) => <Row key={it.key} it={it} />)}</div>
        </div>
      ))}
    </div>
  );
}

function NewSetting() {
  const router = useRouter();
  const t = useTranslations('admin.settings');
  const tc = useTranslations('admin.common');
  const [d, setD] = useState({ key: '', value: '', group: '' });
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!d.key.trim()) {
      toast('error', t('keyRequired'));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...d, group: d.group.trim() || 'general' }),
      });
      if (!res.ok) { toast('error', tc('createFailed')); return; }
      toast('success', tc('created'));
      setD({ key: '', value: '', group: '' });
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
          <input
            className="input font-mono text-xs"
            dir="ltr"
            placeholder={t('placeholders.key')}
            value={d.key}
            onChange={(e) => setD({ ...d, key: e.target.value })}
          />
        </div>
        <div className="sm:col-span-3">
          <label className="text-[10px] tracking-cinematic text-muted block mb-1">{t('groupLabel')}</label>
          <input
            className="input font-mono text-xs"
            dir="ltr"
            placeholder={t('placeholders.group')}
            value={d.group}
            onChange={(e) => setD({ ...d, group: e.target.value })}
          />
        </div>
        <div className="sm:col-span-4">
          <label className="text-[10px] tracking-cinematic text-muted block mb-1">{t('valueLabel')}</label>
          <input
            className="input"
            placeholder={t('placeholders.value')}
            value={d.value}
            onChange={(e) => setD({ ...d, value: e.target.value })}
          />
        </div>
        <div className="sm:col-span-1 flex items-end">
          <button onClick={add} disabled={busy} className="btn-primary w-full inline-flex items-center justify-center disabled:opacity-50">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ it }: any) {
  const router = useRouter();
  const tc = useTranslations('admin.common');
  const [v, setV] = useState(it.value);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: it.key, value: v, group: it.group }),
      });
      if (!res.ok) { toast('error', tc('updateFailed')); return; }
      toast('success', tc('saved'));
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <code className="col-span-4 text-xs text-electric font-mono">{it.key}</code>
      <input className="input col-span-7" value={v} onChange={(e) => setV(e.target.value)} />
      <button onClick={save} disabled={busy} className="btn-ghost col-span-1 disabled:opacity-50" aria-label={tc('save')}>
        <Save className="w-4 h-4" />
      </button>
    </div>
  );
}
