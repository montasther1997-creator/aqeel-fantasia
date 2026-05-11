'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';

type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'url' | 'color' };

const FIELDS: Field[] = [
  { key: 'appearance.heroVideoUrl', label: 'Hero Video URL', type: 'url' },
  { key: 'appearance.logoUrl', label: 'Logo URL', type: 'url' },
  { key: 'appearance.faviconUrl', label: 'Favicon URL', type: 'url' },
  { key: 'appearance.brandTagline', label: 'Brand Tagline' },
  { key: 'appearance.brandTaglineAr', label: 'Brand Tagline (Arabic)' },
  { key: 'appearance.primaryAccent', label: 'Primary Accent', type: 'color' },
  { key: 'appearance.heroOverlayOpacity', label: 'Hero Overlay Opacity (0–1)' },
];

export function AppearanceForm({ initial }: { initial: Record<string, string> }) {
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
      if (!res.ok) { toast('error', 'Save failed'); return; }
      toast('success', 'Saved');
      startTransition(() => router.refresh());
    } catch {
      toast('error', 'Save failed');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="glass p-6 space-y-5">
      {FIELDS.map((f) => (
        <div key={f.key} className="grid lg:grid-cols-[1fr_2fr_auto] gap-3 items-center">
          <label className="text-xs tracking-cinematic text-muted uppercase">{f.label}</label>
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
            {savingKey === f.key ? 'Saving…' : 'Save'}
          </button>
        </div>
      ))}
    </div>
  );
}
