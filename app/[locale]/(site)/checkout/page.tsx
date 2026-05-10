'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-store';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { formatIQD, formatUSD } from '@/lib/utils';
import { IRAQ_GOVERNORATES_AR, IRAQ_GOVERNORATES_EN } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const locale = useLocale() as 'ar' | 'en';
  const items = useCart((s) => s.items);
  const currency = useCart((s) => s.currency);
  const discount = useCart((s) => s.discount);
  const shipping = useCart((s) => s.shipping);
  const setShipping = useCart((s) => s.setShipping);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', country: locale === 'ar' ? 'العراق' : 'Iraq',
    governorate: '', city: '', area: '', street: '', details: '', notes: '',
  });

  const subIQD = items.reduce((n, x) => n + x.priceIQD * x.qty, 0);
  const subUSD = items.reduce((n, x) => n + x.priceUSD * x.qty, 0);
  const sub = currency === 'IQD' ? subIQD : subUSD;
  const disc = discount?.discount || 0;
  const ship = shipping ? (currency === 'IQD' ? shipping.priceIQD : shipping.priceUSD) : 0;
  const total = Math.max(0, sub - disc + ship);

  const fmt = (v: number) => currency === 'IQD' ? formatIQD(v, locale) : formatUSD(v, locale);
  const govs = locale === 'ar' ? IRAQ_GOVERNORATES_AR : IRAQ_GOVERNORATES_EN;

  // Auto-calc shipping when governorate changes
  useEffect(() => {
    if (!form.governorate) { setShipping(null); return; }
    fetch('/api/shipping', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ governorate: form.governorate }) })
      .then((r) => r.json()).then((d) => {
        if (d.ok) setShipping({ name: d.name, priceIQD: d.priceIQD, priceUSD: d.priceUSD, etaDays: d.etaDays });
      });
  }, [form.governorate, setShipping]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, currency, items, discount, shipping }),
      });
      const data = await res.json();
      if (data.ok) {
        clear();
        router.push(`/checkout/success?o=${data.number}` as any);
      } else { alert(data.error || 'error'); }
    } finally { setLoading(false); }
  };

  if (!items.length) {
    return <div className="pt-32 container-x"><p className="text-muted">Empty cart.</p></div>;
  }

  return (
    <div className="pt-32 pb-20 container-x">
      <h1 className="h-display text-5xl sm:text-6xl mb-10">{t('title')}</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-10">
          <fieldset>
            <legend className="text-xs tracking-cinematic uppercase text-muted mb-4">— {t('contact')}</legend>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="label">{t('name')}</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">{t('phone')}</label><input required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+964 ..." /></div>
              <div className="sm:col-span-2"><label className="label">{t('email')}</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs tracking-cinematic uppercase text-muted mb-4">— {t('shipping')}</legend>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="label">{t('country')}</label><input className="input" value={form.country} disabled /></div>
              <div>
                <label className="label">{t('governorate')}</label>
                <select required className="input" value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}>
                  <option value="">—</option>
                  {govs.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div><label className="label">{t('city')}</label><input required className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><label className="label">{t('area')}</label><input className="input" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label">{t('street')}</label><input className="input" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label">{t('details')}</label><textarea className="input min-h-[80px]" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="label">{t('notes')}</label><textarea className="input min-h-[60px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            {shipping && (
              <p className="text-xs text-electric mt-3">→ {shipping.name} · {fmt(currency === 'IQD' ? shipping.priceIQD : shipping.priceUSD)} · {shipping.etaDays} {locale === 'ar' ? 'أيام' : 'days'}</p>
            )}
          </fieldset>
        </motion.div>

        <div className="glass-strong p-6 h-fit lg:sticky lg:top-24">
          <h3 className="text-xs tracking-cinematic uppercase text-muted mb-4">— {t('review')}</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {items.map((it) => (
              <div key={it.productId + (it.variantId || '')} className="flex gap-3 text-sm">
                <div className="w-12 h-16 bg-bg-secondary shrink-0">{it.image && <img src={it.image} className="w-full h-full object-cover" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs tracking-cinematic uppercase">{locale === 'ar' ? it.nameAr : it.nameEn}</p>
                  <p className="text-xs text-muted">x{it.qty} {it.size && `· ${it.size}`}</p>
                </div>
                <span className="text-xs">{fmt(currency === 'IQD' ? it.priceIQD * it.qty : it.priceUSD * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="divider-line my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{fmt(sub)}</span></div>
            {discount && <div className="flex justify-between text-electric"><span>{discount.code}</span><span>-{fmt(disc)}</span></div>}
            {shipping && <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{fmt(ship)}</span></div>}
            <div className="flex justify-between text-lg font-display pt-2 border-t border-line"><span>TOTAL</span><span>{fmt(total)}</span></div>
          </div>
          <p className="mt-4 text-xs text-muted">{t('cod')}</p>
          <button type="submit" disabled={loading || !shipping} className="btn-primary w-full mt-6">{loading ? '...' : t('place')}</button>
        </div>
      </form>
    </div>
  );
}
