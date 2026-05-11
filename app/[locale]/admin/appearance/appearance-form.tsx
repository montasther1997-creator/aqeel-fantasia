'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';

type Field = { key: string; labelKey: string; type?: 'text' | 'textarea' | 'url' | 'color' };

const FIELDS: Field[] = [
  { key: 'appearance.heroVideoUrl', labelKey: 'heroVideoUrl', type: 'url' },
  { key: 'appearance.logoUrl', labelKey: 'logoUrl', type: 'url' },
  { key: 'appearance.faviconUrl', labelKey: 'faviconUrl', type: 'url' },
  { key: 'appearance.brandTagline', labelKey: 'brandTagline' },
  { key: 'appearance.brandTaglineAr', labelKey: 'brandTaglineAr' },
  { key: 'appearance.primaryAccent', labelKey: 'primaryAccent', type: 'color' },
  { key: 'appearance.heroOverlayOpacity', labelKey: 'heroOverlayOpacity' },
];

export function AppearanceForm({ initial }: { initial: Record<string, string> }) {
  const t = useTranslations('admin.appearance');
  const tc = useTranslations('admin');
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const save = async (key: string) => {
    setSavingKey(key);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: values[key] || '', group: 'appearance' }),
      });
      if (!res.ok) { toast('error', tc('common.saveFailed')); return; }
      toast('success', tc('common.saved'));
      startTransition(() => router.refresh());
    } catch {
      toast('error', tc('common.saveFailed'));
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="glass p-6 space-y-5">
      {FIELDS.map((f) => (
        <div key={f.key} className="grid lg:grid-cols-[1fr_2fr_auto] gap-3 items-center">
          <label className="text-xs tracking-cinematic text-muted uppercase">{t(`fields.${f.labelKey}` as any)}</label>
          {f.type === 'textarea' ? (
            <textarea
              className="input"
              rows={3}
              value={values[f.key] || ''}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          ) : f.type === 'color' ? (
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-12 h-10 border border-line bg-bg-secondary"
                value={values[f.key] || '#000000'}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
              <input
                type="text"
                className="input flex-1"
                value={values[f.key] || ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
            </div>
          ) : (
            <input
              type={f.type || 'text'}
              className="input"
              value={values[f.key] || ''}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          )}
          <button
            onClick={() => save(f.key)}
            disabled={savingKey === f.key}
            className="btn-primary disabled:opacity-50"
          >
            {savingKey === f.key ? t('saving') : t('save')}
          </button>
        </div>
      ))}
    </div>
  );
}
