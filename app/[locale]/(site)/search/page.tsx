'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
    const tm = setTimeout(async () => {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setResults(d.products || []);
    }, 200);
    return () => clearTimeout(tm);
  }, [q]);

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x">
        <header className={`mb-12 ${isAr ? 'text-right' : 'text-left'}`}>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('title')}</h1>
        </header>
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Icon name="search" size={20} className="text-fg-tertiary" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('placeholder')} className="flex-1 bg-transparent outline-none text-lg" />
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {results.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </div>
  );
}
