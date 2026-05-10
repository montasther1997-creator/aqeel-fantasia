'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart-store';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatIQD, formatUSD } from '@/lib/utils';
import { X, Minus, Plus, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale() as 'ar' | 'en';
  const items = useCart((s) => s.items);
  const currency = useCart((s) => s.currency);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const discount = useCart((s) => s.discount);
  const setDiscount = useCart((s) => s.setDiscount);

  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const subIQD = items.reduce((n, x) => n + x.priceIQD * x.qty, 0);
  const subUSD = items.reduce((n, x) => n + x.priceUSD * x.qty, 0);
  const sub = currency === 'IQD' ? subIQD : subUSD;
  const disc = discount?.discount || 0;
  const total = Math.max(0, sub - disc);
  const fmt = (i: number, u: number) => currency === 'IQD' ? formatIQD(i, locale) : formatUSD(u, locale);
  const fmtAmount = (v: number) => currency === 'IQD' ? formatIQD(v, locale) : formatUSD(v, locale);

  const apply = async () => {
    if (!code) return;
    setBusy(true); setErr('');
    const r = await fetch('/api/discount', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code, subtotal: sub }) });
    const d = await r.json();
    setBusy(false);
    if (d.ok) { setDiscount({ code: d.code, type: d.type, value: d.value, discount: d.discount }); setCode(''); }
    else setErr(d.error);
  };

  return (
    <div className="pt-32 pb-20 container-x min-h-screen">
      <h1 className="h-display text-5xl sm:text-7xl mb-12">{t('title')}</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted">{t('empty')}</p>
          <Link href={'/drops' as any} className="btn-primary mt-8 inline-flex">{t('continue')}</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={`${item.productId}-${item.variantId || ''}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="glass p-4 flex gap-4"
              >
                <div className="w-24 h-32 bg-bg-secondary overflow-hidden shrink-0">
                  {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="text-sm tracking-cinematic uppercase">{locale === 'ar' ? item.nameAr : item.nameEn}</h3>
                      {item.size && <p className="text-xs text-muted mt-1">{item.size}</p>}
                    </div>
                    <button onClick={() => remove(item.productId, item.variantId)} className="text-muted hover:text-frost"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center border border-line">
                      <button onClick={() => setQty(item.productId, item.qty - 1, item.variantId)} className="w-8 h-8 grid place-items-center"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm">{item.qty}</span>
                      <button onClick={() => setQty(item.productId, item.qty + 1, item.variantId)} className="w-8 h-8 grid place-items-center"><Plus className="w-3 h-3" /></button>
                    </div>
                    <span className="text-sm">{fmt(item.priceIQD * item.qty, item.priceUSD * item.qty)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="glass-strong p-6 h-fit lg:sticky lg:top-24">
            <h3 className="text-xs tracking-cinematic uppercase text-muted mb-6">— ORDER</h3>

            {/* Discount code */}
            {discount ? (
              <div className="mb-4 flex items-center justify-between p-2 border border-electric/40 bg-electric/5">
                <span className="text-xs flex items-center gap-1"><Tag className="w-3 h-3 text-electric" /> {discount.code}</span>
                <button onClick={() => setDiscount(null)} className="text-muted hover:text-frost"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input flex-1 text-xs" placeholder="DISCOUNT CODE" />
                  <button onClick={apply} disabled={busy} className="btn-ghost text-xs">{busy ? '...' : 'APPLY'}</button>
                </div>
                {err && <p className="text-blood text-xs mt-1">{err}</p>}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted">{t('subtotal')}</span><span>{fmtAmount(sub)}</span></div>
              {discount && <div className="flex justify-between text-electric"><span>{discount.code}</span><span>-{fmtAmount(disc)}</span></div>}
              <div className="flex justify-between"><span className="text-muted">{t('shipping')}</span><span className="text-muted">→ checkout</span></div>
              <div className="divider-line my-3" />
              <div className="flex justify-between text-lg font-display"><span>{t('total')}</span><span>{fmtAmount(total)}</span></div>
            </div>
            <Link href={'/checkout' as any} className="btn-primary w-full mt-6">{t('checkout')}</Link>
            <Link href={'/drops' as any} className="btn-ghost w-full mt-3">{t('continue')}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
