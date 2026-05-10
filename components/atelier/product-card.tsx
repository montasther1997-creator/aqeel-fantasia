'use client';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Editorial } from './editorial';
import { Icon } from './icons';
import { fmtNumber } from '@/lib/utils';
import { useState } from 'react';

export function ProductCard({ p, saved, onSave }: { p: any; saved?: boolean; onSave?: (id: string) => void }) {
  const locale = useLocale() as 'ar' | 'en';
  const [hovered, setHovered] = useState(false);
  const name = locale === 'ar' ? p.nameAr : p.nameEn;
  const meta = locale === 'ar' ? p.taglineAr : p.taglineEn;
  const img = p.images?.[0]?.url;

  return (
    <Link href={`/product/${p.slug}` as any} className="pcard block group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="img-wrap">
        <Editorial variant="v2" ratio="4/5" src={img} alt={name} glyph={img ? undefined : (p.sku || 'AF')} />
        {onSave && (
          <button
            className={`heart ${saved ? 'saved' : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(p.id); }}
            aria-label="save"
          >
            <Icon name="heart" size={16} />
          </button>
        )}
      </div>
      <div className="name">{name}</div>
      <div className="meta">{meta}</div>
      <div className="price"><span className="num">{fmtNumber(p.priceIQD)}</span> {locale === 'ar' ? 'د.ع' : 'IQD'}</div>
    </Link>
  );
}
