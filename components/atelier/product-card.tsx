'use client';
import { Link, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Editorial } from './editorial';
import { Icon } from './icons';
import { Price } from '@/components/ui/price';
import { useState } from 'react';
import { toast } from '@/components/ui/toast';

export function ProductCard({ p, saved, onSave }: { p: any; saved?: boolean; onSave?: (id: string) => void }) {
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(!!saved);
  const [busy, setBusy] = useState(false);
  const name = isAr ? p.nameAr : p.nameEn;
  const meta = isAr ? p.taglineAr : p.taglineEn;
  const img = p.images?.[0]?.url;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) { onSave(p.id); return; }
    if (busy) return;
    setBusy(true);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      const res = await fetch('/api/account/wishlist', {
        method: nextSaved ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: p.id }),
      });
      if (res.status === 401) {
        setIsSaved(!nextSaved);
        toast('info', isAr ? 'سجّل الدخول لحفظ القطع' : 'Sign in to save items');
        router.push('/account/login' as any);
        return;
      }
      if (!res.ok) {
        setIsSaved(!nextSaved);
        toast('error', isAr ? 'تعذّر الحفظ' : 'Could not save');
        return;
      }
      toast('success', nextSaved
        ? (isAr ? 'أُضيف إلى المحفوظات' : 'Saved')
        : (isAr ? 'أُزيل من المحفوظات' : 'Removed'));
    } catch {
      setIsSaved(!nextSaved);
      toast('error', isAr ? 'تعذّر الحفظ' : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link href={`/product/${p.slug}` as any} className="pcard block group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="img-wrap relative">
        <Editorial variant="v2" ratio="4/5" src={img} alt={name} glyph={img ? undefined : (p.sku || 'AF')} />
        <button
          className={`heart absolute top-3 ${isAr ? 'left-3' : 'right-3'} w-9 h-9 flex items-center justify-center bg-bg/70 backdrop-blur-sm border border-border hover:border-accent transition-colors ${isSaved ? 'text-accent border-accent' : 'text-fg'}`}
          onClick={toggleWishlist}
          aria-label="save"
        >
          <Icon name="heart" size={16} />
        </button>
      </div>
      <div className="name">{name}</div>
      <div className="meta">{meta}</div>
      <Price iqd={p.priceIQD} usd={p.priceUSD} compareIQD={p.compareIQD} compareUSD={p.compareUSD} className="price" />
    </Link>
  );
}
