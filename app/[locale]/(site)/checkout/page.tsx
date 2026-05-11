'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/lib/cart-store';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { fmtNumber } from '@/lib/utils';
import { IRAQ_GOVERNORATES_AR, IRAQ_GOVERNORATES_EN } from '@/lib/constants';
import { toast } from '@/components/ui/toast';

type FormKey = 'name' | 'phone' | 'email' | 'governorate' | 'city' | 'area' | 'street' | 'details' | 'notes';
const REQUIRED_FIELDS: FormKey[] = ['name', 'phone', 'governorate', 'city', 'street'];

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
  const [errors, setErrors] = useState<Partial<Record<FormKey, boolean>>>({});
  const [shipping, setShipping] = useState<{ name: string; priceIQD: number } | null>(null);
  const govs = isAr ? IRAQ_GOVERNORATES_AR : IRAQ_GOVERNORATES_EN;
  const fieldRefs = useRef<Partial<Record<FormKey, HTMLElement | null>>>({});

  const setField = (key: FormKey, v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (errors[key] && v.trim()) setErrors((e) => ({ ...e, [key]: false }));
  };

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

    const nextErrors: Partial<Record<FormKey, boolean>> = {};
    for (const key of REQUIRED_FIELDS) {
      if (!String(form[key] || '').trim()) nextErrors[key] = true;
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast('error', isAr ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill all required fields');
      const firstKey = REQUIRED_FIELDS.find((k) => nextErrors[k]);
      if (firstKey) {
        const el = fieldRefs.current[firstKey];
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (el as HTMLInputElement | HTMLSelectElement | null)?.focus?.();
      }
      return;
    }

    if (!shipping) {
      toast('error', isAr ? 'يرجى اختيار المحافظة لاحتساب الشحن' : 'Select a governorate to compute shipping');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, currency: 'IQD', items, discount }) });
      const d = await res.json();
      if (d.ok) {
        clear();
        toast('success', isAr ? 'تم تأكيد الطلب' : 'Order placed');
        router.push(`/checkout/success?o=${d.number}` as any);
      } else {
        toast('error', d.error || (isAr ? 'تعذّر تأكيد الطلب' : 'Could not place order'));
      }
    } catch {
      toast('error', isAr ? 'حدث خطأ في الشبكة' : 'Network error');
    } finally {
      setBusy(false);
    }
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
                <Field label={t('name')} value={form.name} onChange={(v) => setField('name', v)} required error={errors.name} isAr={isAr} inputRef={(el) => (fieldRefs.current.name = el)} />
                <Field label={t('phone')} value={form.phone} onChange={(v) => setField('phone', v)} required dir="ltr" placeholder="+964..." error={errors.phone} isAr={isAr} inputRef={(el) => (fieldRefs.current.phone = el)} />
                <Field label={`${t('email')}${isAr ? ' (اختياري)' : ' (optional)'}`} value={form.email} onChange={(v) => setField('email', v)} dir="ltr" isAr={isAr} />
              </div>
            </Section>

            <Section label={t('shipping')}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className={`field-label ${errors.governorate ? 'text-burgundy' : ''}`}>{t('governorate')} <span className="text-burgundy">*</span></div>
                  <select
                    ref={(el) => { fieldRefs.current.governorate = el; }}
                    className={`field ${errors.governorate ? 'border-burgundy ring-1 ring-burgundy' : ''}`}
                    value={form.governorate}
                    onChange={(e) => setField('governorate', e.target.value)}
                  >
                    <option value="">—</option>
                    {govs.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {errors.governorate && <div className="text-burgundy text-xs mt-1">{isAr ? 'يرجى اختيار المحافظة' : 'Please select governorate'}</div>}
                </div>
                <Field label={t('city')} value={form.city} onChange={(v) => setField('city', v)} required error={errors.city} isAr={isAr} inputRef={(el) => (fieldRefs.current.city = el)} />
                <Field label={t('area')} value={form.area} onChange={(v) => setField('area', v)} isAr={isAr} />
                <Field label={t('street')} value={form.street} onChange={(v) => setField('street', v)} required error={errors.street} isAr={isAr} inputRef={(el) => (fieldRefs.current.street = el)} />
              </div>
              <div className="mt-6">
                <Field label={t('details')} value={form.details} onChange={(v) => setField('details', v)} isAr={isAr} />
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
              <button type="submit" disabled={busy} className="btn btn-champagne w-full mt-6">{busy ? '…' : t('place')}</button>
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

function Field({
  label, value, onChange, required, dir, placeholder, error, isAr, inputRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  dir?: string;
  placeholder?: string;
  error?: boolean;
  isAr?: boolean;
  inputRef?: (el: HTMLInputElement | null) => void;
}) {
  return (
    <div>
      <div className={`field-label ${error ? 'text-burgundy' : ''}`}>
        {label}{required && <span className="text-burgundy"> *</span>}
      </div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir as any}
        placeholder={placeholder}
        className={`field ${error ? 'border-burgundy ring-1 ring-burgundy' : ''}`}
      />
      {error && (
        <div className="text-burgundy text-xs mt-1">
          {isAr ? 'هذا الحقل مطلوب' : 'This field is required'}
        </div>
      )}
    </div>
  );
}
