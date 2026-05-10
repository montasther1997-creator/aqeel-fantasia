'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
import { BottomNav } from '@/components/atelier/bottomnav';
import { ProductCard } from '@/components/atelier/product-card';
import { Icon } from '@/components/atelier/icons';

export default function SearchPage() {
  const t = useTranslations('search');
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (q.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setResults(d.products || []);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body has-bottomnav">
        <TopBar />
        <header className={`px-6 pt-8 pb-6 ${isAr ? 'text-right' : 'text-left'}`}>
          <h1 className="serif text-4xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('title')}</h1>
        </header>
        <div className="px-6">
          <div className="flex items-center gap-3 border-b border-border pb-2">
            <Icon name="search" size={18} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('placeholder')} className="flex-1 bg-transparent outline-none text-base" />
          </div>
        </div>
        <div className="px-6 pt-8 grid grid-cols-2 gap-3">
          {results.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
