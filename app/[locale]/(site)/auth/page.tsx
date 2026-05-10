'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { Crest } from '@/components/atelier/crest';
import { Icon } from '@/components/atelier/icons';

export default function AuthPage() {
  const t = useTranslations('auth');
  const locale = useLocale() as 'ar' | 'en';
  const router = useRouter();
  const isAr = locale === 'ar';
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ name: '', phone: '', password: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const url = mode === 'login' ? '/api/account/login' : '/api/account/register';
    const body = mode === 'login'
      ? { phone: form.phone, password: form.password }
      : { name: form.name, phone: form.phone, password: form.password, email: form.email || undefined };
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    setBusy(false);
    if (d.ok) router.push('/home' as any);
    else setErr(d.error || 'failed');
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left: image (desktop) / hero (mobile) */}
      <div className="relative h-[40vh] md:h-screen md:sticky md:top-0 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1600&q=85" alt="" className="w-full h-full object-cover" style={{ filter: 'grayscale(0.3) contrast(1.1) brightness(0.55)' }} />
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-onyx/30 to-onyx" />
        <div className="absolute top-6 md:top-12 left-6 md:left-12 text-pearl">
          <Crest size={40} className="md:w-12 md:h-12" />
        </div>
        <div className="absolute bottom-8 md:bottom-12 left-6 md:left-12 right-6 md:right-12 text-pearl">
          <div className="text-[10px] tracking-[0.3em] uppercase text-bone mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {t('eyebrow')}
          </div>
          <h1 className="serif font-light leading-[0.95] text-5xl md:text-7xl lg:text-8xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.03em' }}>
            {t('headline1')}<br />
            <em style={{ color: 'var(--accent)', fontStyle: isAr ? 'normal' : 'italic', fontWeight: 400 }}>{t('headline2')}</em>
          </h1>
          <p className="text-bone mt-6 max-w-md opacity-85">{t('sub')}</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="bg-bg p-6 md:p-12 lg:p-20 flex flex-col justify-center">
        <button onClick={() => router.back()} className="self-start mb-8 text-fg-tertiary hover:text-fg flex items-center gap-2 text-xs tracking-[0.2em] uppercase" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          <Icon name={isAr ? 'chevronR' : 'chevronL'} size={16} /> {isAr ? 'رجوع' : 'Back'}
        </button>

        <div className="max-w-md w-full mx-auto">
          <h2 className="serif text-4xl md:text-5xl font-light mb-3" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {mode === 'login' ? (isAr ? 'أهلاً بعودتك' : 'Welcome back') : (isAr ? 'إنشاء حساب' : 'Create your account')}
          </h2>
          <p className="text-fg-secondary text-sm mb-10">
            {mode === 'login' ? (isAr ? 'سجّل الدخول للوصول إلى حسابك.' : 'Sign in to access your account.') : (isAr ? 'انضم إلى الأتيليه.' : 'Join the atelier.')}
          </p>

          <form onSubmit={submit} className="space-y-6">
            {mode === 'signup' && (
              <div>
                <label className="field-label">{t('name')}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="field" />
              </div>
            )}
            <div>
              <label className="field-label">{t('phone')}</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required dir="ltr" placeholder="+964..." className="field" />
            </div>
            <div>
              <label className="field-label">{t('password')}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="field" />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="field-label">{t('emailOptional')}</label>
                <input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" />
              </div>
            )}
            {err && <p className="text-burgundy text-xs">{err}</p>}
            <button type="submit" disabled={busy} className="btn btn-champagne w-full mt-2">
              {busy ? '…' : (mode === 'login' ? t('submitLogin') : t('submitSignup'))}
            </button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-3">
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-fg-secondary hover:text-fg underline underline-offset-4">
                {mode === 'login' ? t('newHere') : t('haveAccount')}
              </button>
              <Link href={'/home' as any} className="text-fg-tertiary hover:text-fg">
                {t('guest')}
              </Link>
            </div>
            <p className="text-[10px] text-fg-tertiary text-center pt-4 leading-relaxed">{t('legal')}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
