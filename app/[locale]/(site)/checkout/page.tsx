'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-store';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
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
    return <div className="h-full relative"><StatusBar /><div className="screen-body"><TopBar leftIcon="chevronL" /><p className="px-6 pt-8 text-fg-secondary">Empty.</p></div></div>;
  }

  return (
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body">
        <TopBar leftIcon="chevronL" hideRight />
        <header className={`px-6 pt-8 pb-6 ${isAr ? 'text-right' : 'text-left'}`}>
          <h1 className="serif text-4xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('title')}</h1>
        </header>

        <form onSubmit={submit} className="px-6 pb-8 space-y-6">
          <Field label={t('name')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label={t('phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required dir="ltr" placeholder="+964..." />
          <Field label={t('email')} value={form.email} onChange={(v) => setForm({ ...form, email: v })} dir="ltr" />
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
          <Field label={t('details')} value={form.details} onChange={(v) => setForm({ ...form, details: v })} />

          <div className="border-t border-border pt-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fg-tertiary">{isAr ? 'المجموع' : 'Subtotal'}</span><span><span className="num">{fmtNumber(sub)}</span> {isAr ? 'د.ع' : 'IQD'}</span></div>
            {shipping && <div className="flex justify-between"><span className="text-fg-tertiary">{isAr ? 'الشحن' : 'Shipping'}</span><span><span className="num">{fmtNumber(ship)}</span></span></div>}
            <div className="border-t border-border pt-3 mt-3 flex justify-between serif text-xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
              <span>{isAr ? 'الإجمالي' : 'Total'}</span>
              <span><span className="num">{fmtNumber(total)}</span> {isAr ? 'د.ع' : 'IQD'}</span>
            </div>
          </div>

          <p className="text-xs text-fg-tertiary">{t('cod')}</p>
          <button type="submit" disabled={busy || !shipping} className="btn btn-champagne w-full">{busy ? '…' : t('place')}</button>
        </form>
      </div>
    </div>
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
