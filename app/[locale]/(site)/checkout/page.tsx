'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-store';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { fmtNumber } from '@/lib/utils';
import { IRAQ_GOVERNORATES_AR, IRAQ_GOVERNORATES_EN } from '@/lib/constants';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const items = useCart((s) => s.items);
  const discount = useCart((s) => s.discount);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', country: isAr ? 'العراق' : 'Iraq', governorate: '', city: '', area: '', street: '', details: '', notes: '' });
  const [shipping, setShipping] = useState<{ name: string; priceIQD: number } | null>(null);
  const govs = isAr ? IRAQ_GOVERNORATES_AR : IRAQ_GOVERNORATES_EN;

  useEffect(() => {
    if (!form.governorate) return;
    fetch('/api/shipping', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ governorate: form.governorate }) })
      .then((r) => r.json()).then((d) => d.ok && setShipping({ name: d.name, priceIQD: d.priceIQD }));
  }, [form.governorate]);

  const sub = items.reduce((n, x) => n + x.priceIQD * x.qty, 0);
  const disc = discount?.discount || 0;
  const ship = shipping?.priceIQD || 0;
  const total = Math.max(0, sub - disc + ship);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setBusy(true);
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, currency: 'IQD', items, discount }) });
    const d = await res.json();
    if (d.ok) { clear(); router.push(`/checkout/success?o=${d.number}` as any); }
    setBusy(false);
  };

  if (!items.length) {
    return <div className="pt-32 container-x"><p className="text-fg-secondary">{isAr ? 'السلة فارغة.' : 'Cart empty.'}</p></div>;
  }

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x">
        <header className={`mb-12 ${isAr ? 'text-right' : 'text-left'}`}>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>{t('title')}</h1>
        </header>

        <form onSubmit={submit} className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Form column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <Section label={t('contact')}>
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label={t('name')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label={t('phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required dir="ltr" placeholder="+964..." />
                <Field label={t('email')} value={form.email} onChange={(v) => setForm({ ...form, email: v })} dir="ltr" />
              </div>
            </Section>

            <Section label={t('shipping')}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="field-label">{t('governorate')}</div>
                  <select required className="field" value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}>
                    <option value="">—</option>
                    {govs.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <Field label={t('city')} value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
                <Field label={t('area')} value={form.area} onChange={(v) => setForm({ ...form, area: v })} />
                <Field label={t('street')} value={form.street} onChange={(v) => setForm({ ...form, street: v })} />
              </div>
              <div className="mt-6">
                <Field label={t('details')} value={form.details} onChange={(v) => setForm({ ...form, details: v })} />
              </div>
            </Section>
          </div>

          {/* Summary column */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-28 p-6 md:p-8 border border-border bg-bg-elevated/40">
              <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-6" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                {isAr ? 'ملخص الطلب' : 'ORDER SUMMARY'}
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar mb-4">
                {items.map((it, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-12 h-16 bg-bg-elevated shrink-0">{it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}</div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs">{isAr ? it.nameAr : it.nameEn}</div>
                      <div className="text-xs text-fg-tertiary num">×{it.qty}{it.size && ` · ${it.size}`}</div>
                    </div>
                    <div className="text-xs"><span className="num">{fmtNumber(it.priceIQD * it.qty)}</span></div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-fg-secondary">{isAr ? 'المجموع' : 'Subtotal'}</span><span><span className="num">{fmtNumber(sub)}</span></span></div>
                {shipping && <div className="flex justify-between"><span className="text-fg-secondary">{isAr ? 'الشحن' : 'Shipping'}</span><span><span className="num">{fmtNumber(ship)}</span></span></div>}
                <div className="border-t border-border pt-3 flex justify-between items-baseline">
                  <span className="serif text-xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="serif text-2xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
                    <span className="num">{fmtNumber(total)}</span> <span className="text-sm text-fg-tertiary">{isAr ? 'د.ع' : 'IQD'}</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-fg-tertiary mt-6">{t('cod')}</p>
              <button type="submit" disabled={busy || !shipping} className="btn btn-champagne w-full mt-6">{busy ? '…' : t('place')}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-5">{label}</div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, required, dir, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; dir?: string; placeholder?: string }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} dir={dir as any} placeholder={placeholder} className="field" />
    </div>
  );
}
