'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';

export default function RegisterPage() {
  const t = useTranslations('account');
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    const res = await fetch('/api/account/register', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) router.push('/account' as any);
    else setErr(data.error || 'error');
  };

  return (
    <div className="pt-32 pb-20 container-x max-w-md mx-auto">
      <h1 className="h-display text-5xl mb-8">{t('registerTitle')}</h1>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">{t('name')}</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">{t('phone')}</label><input required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+964 ..." /></div>
        <div><label className="label">{t('emailOptional')}</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label">{t('password')}</label><input required type="password" className="input" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        {err && <p className="text-blood text-sm">{err}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? '...' : t('registerCta')}</button>
      </form>
      <p className="mt-8 text-sm text-muted">{t('haveAccount')} <Link href={'/account/login' as any} className="text-frost hover:text-electric">{t('loginCta')}</Link></p>
    </div>
  );
}
