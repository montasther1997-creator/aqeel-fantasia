'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { useTranslations } from 'next-intl';

export default function AdminLogin() {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations('admin.login');
  const tc = useTranslations('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('');
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) router.push(`/${locale}/admin`);
    else setErr(data.error || t('invalid'));
  };

  return (
    <div className="min-h-screen grid place-items-center bg-bg-primary text-frost p-6" dir="ltr">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Logo className="inline-block" />
          <p className="mt-2 text-[10px] tracking-cinematic text-electric">{tc('controlRoom').toUpperCase()}</p>
        </div>
        <form onSubmit={submit} className="glass-strong p-8 space-y-4">
          <h1 className="h-display text-2xl mb-4">{t('title')}</h1>
          <div><label className="label">{t('email')}</label><input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="label">{t('password')}</label><input required type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {err && <p className="text-blood text-sm">{err}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? t('loading') : t('enter')}</button>
        </form>
        <p className="mt-6 text-center text-xs text-muted">{t('hint')}</p>
      </div>
    </div>
  );
}
