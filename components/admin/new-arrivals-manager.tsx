'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Sparkles, Crown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from '@/components/ui/toast';

type Featured = {
  id: string;
  productId: string;
  order: number;
  nameAr: string;
  nameEn: string;
  sku: string | null;
  image: string | null;
};

type Latest = {
  id: string;
  nameAr: string;
  nameEn: string;
  sku: string | null;
  createdAt: string;
  image: string | null;
};

type ProductOption = {
  id: string;
  nameAr: string;
  nameEn: string;
  sku: string | null;
  slug: string;
};

export function NewArrivalsManager({
  featured, latestProducts, allActiveProducts,
}: {
  featured: Featured[];
  latestProducts: Latest[];
  allActiveProducts: ProductOption[];
}) {
  const router = useRouter();
  const t = useTranslations('admin.newArrivals');
  const tc = useTranslations('admin.common');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);

  const featuredIds = new Set(featured.map((f) => f.productId));
  const availableProducts = allActiveProducts.filter((p) => !featuredIds.has(p.id));

  const add = async () => {
    if (!selectedId) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/new-arrivals/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedId, order: featured.length }),
      });
      if (!res.ok) { toast('error', tc('createFailed')); return; }
      toast('success', t('addedToFeatured'));
      setSelectedId('');
      router.refresh();
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(t('confirmRemove'))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/new-arrivals/feature/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast('error', tc('deleteFailed')); return; }
      toast('success', tc('deleted'));
      router.refresh();
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-10">
      {/* Manual featured picks */}
      <section className="ed-card space-y-4">
        <div className="ed-section-head">
          <span className="em-dash" />
          <span className="title inline-flex items-center gap-2">
            <Crown className="w-3.5 h-3.5" /> {t('manual.heading')}
          </span>
          <span className="count num">{featured.length}</span>
        </div>
        <p className="text-sm text-muted">{t('manual.intro')}</p>

        <div className="flex gap-2 flex-wrap">
          <select className="input min-w-[280px]" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">— {t('manual.selectProduct')} —</option>
            {availableProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {isAr ? p.nameAr : p.nameEn} {p.sku ? `· ${p.sku}` : ''}
              </option>
            ))}
          </select>
          <button onClick={add} disabled={!selectedId || busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> {t('manual.add')}
          </button>
        </div>

        {featured.length === 0 ? (
          <p className="ed-caption text-muted text-center py-8">{t('manual.empty')}</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {featured.map((f) => (
              <li key={f.id} className="border border-line p-3 flex items-center gap-3 group hover:border-accent transition-colors">
                <div className="w-12 h-16 bg-bg-secondary shrink-0">
                  {f.image && <img src={f.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-frost truncate">{isAr ? f.nameAr : f.nameEn}</p>
                  <p className="text-[10px] text-muted font-mono">{f.sku}</p>
                </div>
                <button
                  onClick={() => remove(f.id)}
                  disabled={busy}
                  className="text-muted hover:text-blood p-1 disabled:opacity-50"
                  aria-label={tc('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Auto-latest products (read-only) */}
      <section className="ed-card space-y-4">
        <div className="ed-section-head">
          <span className="em-dash" />
          <span className="title inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> {t('auto.heading')}
          </span>
          <span className="count num">{latestProducts.length}</span>
        </div>
        <p className="text-sm text-muted">{t('auto.intro')}</p>

        {latestProducts.length === 0 ? (
          <p className="ed-caption text-muted text-center py-8">{t('auto.empty')}</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {latestProducts.map((p) => (
              <li key={p.id} className="border border-line p-3 flex items-center gap-3">
                <div className="w-12 h-16 bg-bg-secondary shrink-0">
                  {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-frost truncate">{isAr ? p.nameAr : p.nameEn}</p>
                  <p className="text-[10px] text-muted font-mono">
                    {new Date(p.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="text-[10px] text-muted opacity-70 mt-2">{t('auto.note')}</p>
      </section>
    </div>
  );
}
