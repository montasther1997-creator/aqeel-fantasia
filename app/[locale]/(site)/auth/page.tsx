'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { StatusBar } from '@/components/atelier/phone-shell';
import { Editorial } from '@/components/atelier/editorial';
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
    <div className="h-full relative overflow-hidden">
      <StatusBar />
      <div className="absolute inset-0">
        <Editorial variant="v8" ratio="auto" className="absolute inset-0" fade>
          {/* Top: crest */}
          <div className="absolute top-[54px] left-0 right-0 px-6 py-4 flex items-center justify-between z-10">
            <button onClick={() => router.back()} className="text-pearl">
              <Icon name={isAr ? 'chevronR' : 'chevronL'} size={20} />
            </button>
            <div className="text-pearl"><Crest size={32} /></div>
            <div className="w-5" />
          </div>

          {/* Center: headline */}
          <div className={`absolute top-[180px] left-0 right-0 px-8 z-[4] text-pearl ${isAr ? 'text-right' : 'text-left'}`}>
            <div className="t-eyebrow text-bone">{t('eyebrow')}</div>
            <h1 className="serif text-4xl sm:text-5xl leading-[0.95] font-light mt-4" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.03em' }}>
              {t('headline1')}<br />
              <em className={isAr ? '' : 'italic'} style={{ color: 'var(--accent)', fontStyle: isAr ? 'normal' : 'italic' }}>{t('headline2')}</em>
            </h1>
            <p className="text-bone text-xs mt-4 opacity-80 max-w-[280px]">{t('sub')}</p>
          </div>

          {/* Bottom: form */}
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 pt-6 z-[5] bg-gradient-to-t from-onyx via-onyx/95 to-transparent">
            <form onSubmit={submit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <div className="field-label">{t('name')}</div>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="field text-pearl" />
                </div>
              )}
              <div>
                <div className="field-label">{t('phone')}</div>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required dir="ltr" placeholder="+964..." className="field text-pearl" />
              </div>
              <div>
                <div className="field-label">{t('password')}</div>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="field text-pearl" />
              </div>
              {mode === 'signup' && (
                <div>
                  <div className="field-label">{t('emailOptional')}</div>
                  <input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field text-pearl" />
                </div>
              )}
              {err && <p className="text-burgundy text-xs">{err}</p>}
              <button type="submit" disabled={busy} className="btn btn-pearl w-full">
                {busy ? '…' : (mode === 'login' ? t('submitLogin') : t('submitSignup'))}
              </button>
              <div className="flex items-center justify-between text-xs pt-1">
                <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-bone underline underline-offset-4">
                  {mode === 'login' ? t('newHere') : t('haveAccount')}
                </button>
                <Link href={'/home' as any} className="text-mist">
                  {t('guest')}
                </Link>
              </div>
              <p className="text-[10px] text-mist text-center pt-2">{t('legal')}</p>
            </form>
          </div>
        </Editorial>
      </div>
    </div>
  );
}
