'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { toast } from '@/components/ui/toast';

export function AtelierBookForm({ initial }: { initial: any }) {
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const [form, setForm] = useState({
    height: initial?.height || '',
    weight: initial?.weight || '',
    preferredSize: initial?.preferredSize || '',
    shoulderWidth: initial?.shoulderWidth || '',
    chestSize: initial?.chestSize || '',
    waistSize: initial?.waistSize || '',
    inseam: initial?.inseam || '',
    preferredColors: initial?.preferredColors || '',
    preferredStyles: initial?.preferredStyles || '',
    preferredFabrics: initial?.preferredFabrics || '',
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const body: any = {};
    for (const k of Object.keys(form) as (keyof typeof form)[]) {
      const v = form[k];
      if (v === '' || v == null) continue;
      if (['height', 'weight', 'shoulderWidth', 'chestSize', 'waistSize', 'inseam'].includes(k)) {
        body[k] = parseInt(String(v), 10);
      } else {
        body[k] = v;
      }
    }
    const r = await fetch('/api/account/preferences', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    setBusy(false);
    if (r.ok) toast('success', isAr ? 'حُفظت تفضيلاتك' : 'Preferences saved');
    else toast('error', isAr ? 'حدث خطأ' : 'Failed to save');
  };

  return (
    <form onSubmit={submit} className="space-y-12">
      {/* Measurements */}
      <section>
        <div className={`text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-6 ${isAr ? 'text-right' : 'text-left'}`} style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          {isAr ? 'القياسات (سم)' : 'MEASUREMENTS (CM)'}
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <NumField label={isAr ? 'الطول' : 'Height'} value={form.height} onChange={(v) => setForm({ ...form, height: v })} placeholder="175" />
          <NumField label={isAr ? 'الوزن (كغ)' : 'Weight (kg)'} value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} placeholder="72" />
          <NumField label={isAr ? 'عرض الكتف' : 'Shoulder width'} value={form.shoulderWidth} onChange={(v) => setForm({ ...form, shoulderWidth: v })} placeholder="46" />
          <NumField label={isAr ? 'محيط الصدر' : 'Chest'} value={form.chestSize} onChange={(v) => setForm({ ...form, chestSize: v })} placeholder="100" />
          <NumField label={isAr ? 'محيط الخصر' : 'Waist'} value={form.waistSize} onChange={(v) => setForm({ ...form, waistSize: v })} placeholder="82" />
          <NumField label={isAr ? 'طول الساق' : 'Inseam'} value={form.inseam} onChange={(v) => setForm({ ...form, inseam: v })} placeholder="80" />
        </div>
      </section>

      {/* Preferred size */}
      <section>
        <div className={`text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-4 ${isAr ? 'text-right' : 'text-left'}`} style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          {isAr ? 'المقاس المُفَضَّل' : 'PREFERRED SIZE'}
        </div>
        <div className="flex flex-wrap gap-2">
          {['46', '48', '50', '52', '54', 'S', 'M', 'L', 'XL'].map((s) => (
            <button type="button" key={s} onClick={() => setForm({ ...form, preferredSize: s })}
              className={`min-w-[3.5rem] h-12 px-4 border text-sm num transition-colors ${form.preferredSize === s ? 'border-fg bg-fg text-bg' : 'border-border text-fg hover:border-fg'}`}>
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Style preferences */}
      <section>
        <div className={`text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-6 ${isAr ? 'text-right' : 'text-left'}`} style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          {isAr ? 'الذوق' : 'TASTE'}
        </div>
        <div className="space-y-6">
          <TextField label={isAr ? 'الألوان المُفَضَّلة' : 'Preferred colors'} value={form.preferredColors} onChange={(v) => setForm({ ...form, preferredColors: v })} placeholder={isAr ? 'فحمي، عاجي، عسلي...' : 'Charcoal, ivory, camel…'} />
          <TextField label={isAr ? 'الأساليب المُفَضَّلة' : 'Preferred styles'} value={form.preferredStyles} onChange={(v) => setForm({ ...form, preferredStyles: v })} placeholder={isAr ? 'كلاسيكي، عصري، مفصّل...' : 'Classic, contemporary, tailored…'} />
          <TextField label={isAr ? 'الأقمشة المُفَضَّلة' : 'Preferred fabrics'} value={form.preferredFabrics} onChange={(v) => setForm({ ...form, preferredFabrics: v })} placeholder={isAr ? 'صوف، كتّان، حرير...' : 'Wool, linen, silk…'} />
        </div>
      </section>

      <button type="submit" disabled={busy} className="btn btn-champagne w-full">
        {busy ? '…' : (isAr ? 'حفظ' : 'Save preferences')}
      </button>
    </form>
  );
}

function NumField({ label, value, onChange, placeholder }: { label: string; value: any; onChange: (v: any) => void; placeholder?: string }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir="ltr" className="field" />
    </div>
  );
}
function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field" />
    </div>
  );
}
