'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Editorial } from '@/components/atelier/editorial';
import { playBell } from '@/lib/sound';

export default function BespokePage() {
  const t = useTranslations('bespoke');
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', occasion: '', preferredDate: '', fitPreference: '', fabricPreference: '', budget: '', contactMethod: 'whatsapp', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await fetch('/api/bespoke', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
    setBusy(false);
    setSubmitted(true);
    playBell(0.06);
  };

  if (submitted) {
    return (
      <div className="pt-20 md:pt-32 pb-32 min-h-screen flex items-center">
        <div className="container-x max-w-2xl text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-4">{t('eyebrow')}</div>
          <h1 className="serif text-5xl md:text-7xl font-light mb-6" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('confirmTitle')}</h1>
          <p className="text-fg-secondary serif italic font-light text-lg max-w-md mx-auto" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>{t('confirmSub')}</p>
          <div className="mt-10 serif italic text-accent text-xl" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
            {t('confirmSignature')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: editorial pitch */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                {t('eyebrow')}
              </div>
              <h1 className="serif text-4xl md:text-6xl lg:text-7xl font-light leading-tight" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>{t('title')}</h1>
              <p className="text-fg-secondary text-base md:text-lg mt-6 leading-relaxed font-light">{t('sub')}</p>
              <div className="mt-10 aspect-[4/5] hidden lg:block">
                <Editorial variant="v8" ratio="auto" className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-7">
            <form onSubmit={submit} className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label={t('name')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label={t('phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required dir="ltr" placeholder="+964..." />
                <Field label={t('email')} value={form.email} onChange={(v) => setForm({ ...form, email: v })} dir="ltr" type="email" />
                <Field label={t('city')} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              </div>
              <Field label={t('occasion')} value={form.occasion} onChange={(v) => setForm({ ...form, occasion: v })} placeholder={t('occasionPlaceholder')} required />
              <Field label={t('preferredDate')} value={form.preferredDate} onChange={(v) => setForm({ ...form, preferredDate: v })} />
              <Textarea label={t('fit')} value={form.fitPreference} onChange={(v) => setForm({ ...form, fitPreference: v })} placeholder={t('fitPlaceholder')} />
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label={t('fabric')} value={form.fabricPreference} onChange={(v) => setForm({ ...form, fabricPreference: v })} placeholder={t('fabricPlaceholder')} />
                <Field label={t('budget')} value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} placeholder={t('budgetPlaceholder')} />
              </div>

              <div>
                <div className="field-label mb-3">{t('contact')}</div>
                <div className="grid grid-cols-3 gap-2">
                  {[['whatsapp', t('whatsapp')], ['phone', t('phoneCall')], ['instagram', t('instagram')]].map(([k, l]) => (
                    <button type="button" key={k} onClick={() => setForm({ ...form, contactMethod: k as string })}
                      className={`py-3 text-xs tracking-[0.16em] border transition-colors ${form.contactMethod === k ? 'border-fg bg-fg text-bg' : 'border-border text-fg-secondary hover:border-fg'}`}
                      style={isAr ? { letterSpacing: 0 } : {}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea label={t('notes')} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />

              <button type="submit" disabled={busy} className="btn btn-champagne w-full mt-2">
                {busy ? '…' : t('submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, dir, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; dir?: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} dir={dir as any} placeholder={placeholder} className="field" />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="field resize-none" />
    </div>
  );
}
