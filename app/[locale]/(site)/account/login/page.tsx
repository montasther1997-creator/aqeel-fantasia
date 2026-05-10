'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';

export default function LoginPage() {
  const t = useTranslations('account');
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    const res = await fetch('/api/account/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) router.push('/account' as any);
    else setErr(data.error || 'error');
  };

  return (
    <div className="pt-32 pb-20 container-x max-w-md mx-auto">
      <h1 className="h-display text-5xl mb-8">{t('loginTitle')}</h1>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">{t('phone')}</label><input required className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+964 ..." /></div>
        <div><label className="label">{t('password')}</label><input required type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {err && <p className="text-blood text-sm">{err}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? '...' : t('loginCta')}</button>
      </form>
      <p className="mt-8 text-sm text-muted">{t('noAccount')} <Link href={'/account/register' as any} className="text-frost hover:text-electric">{t('registerCta')}</Link></p>
    </div>
  );
}
