'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
import { Editorial } from '@/components/atelier/editorial';

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
  };

  if (submitted) {
    return (
      <div className="h-full relative">
        <StatusBar />
        <div className="screen-body">
          <TopBar leftIcon="chevronL" hideRight />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <Editorial variant="v8" ratio="auto" className="absolute inset-0 opacity-30" />
            <div className="relative z-10">
              <div className="t-eyebrow mb-4">{t('eyebrow')}</div>
              <h1 className="serif text-5xl font-light mb-6" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('confirmTitle')}</h1>
              <p className="text-fg-secondary serif italic font-light max-w-[280px]" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>{t('confirmSub')}</p>
              <div className="mt-10 serif italic text-accent" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
                {t('confirmSignature')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body">
        <TopBar leftIcon="chevronL" hideRight />

        <header className={`px-6 pt-8 pb-6 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="t-eyebrow">{t('eyebrow')}</div>
          <h1 className="serif text-4xl font-light mt-3 leading-tight" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.01em' }}>{t('title')}</h1>
          <p className="text-fg-secondary text-sm mt-3 font-light leading-relaxed">{t('sub')}</p>
        </header>

        <form onSubmit={submit} className="px-6 pb-12 space-y-6">
          <Field label={t('name')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label={t('phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required dir="ltr" placeholder="+964..." />
          <Field label={t('email')} value={form.email} onChange={(v) => setForm({ ...form, email: v })} dir="ltr" type="email" />
          <Field label={t('city')} value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label={t('occasion')} value={form.occasion} onChange={(v) => setForm({ ...form, occasion: v })} placeholder={t('occasionPlaceholder')} required />
          <Field label={t('preferredDate')} value={form.preferredDate} onChange={(v) => setForm({ ...form, preferredDate: v })} />
          <Textarea label={t('fit')} value={form.fitPreference} onChange={(v) => setForm({ ...form, fitPreference: v })} placeholder={t('fitPlaceholder')} />
          <Field label={t('fabric')} value={form.fabricPreference} onChange={(v) => setForm({ ...form, fabricPreference: v })} placeholder={t('fabricPlaceholder')} />
          <Field label={t('budget')} value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} placeholder={t('budgetPlaceholder')} />

          <div>
            <div className="field-label mb-3">{t('contact')}</div>
            <div className="flex gap-2">
              {[['whatsapp', t('whatsapp')], ['phone', t('phoneCall')], ['instagram', t('instagram')]].map(([k, l]) => (
                <button type="button" key={k} onClick={() => setForm({ ...form, contactMethod: k as string })}
                  className={`flex-1 py-2 text-xs tracking-[0.16em] border ${form.contactMethod === k ? 'border-fg bg-fg text-bg' : 'border-border text-fg-secondary'}`}
                  style={isAr ? { letterSpacing: 0 } : {}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <Textarea label={t('notes')} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />

          <button type="submit" disabled={busy} className="btn btn-champagne w-full">
            {busy ? '…' : t('submit')}
          </button>
        </form>
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
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="field resize-none" />
    </div>
  );
}
