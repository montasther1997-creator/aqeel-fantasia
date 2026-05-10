'use client';
import { useCart } from '@/lib/cart-store';
import { fmtNumber } from '@/lib/utils';
import { useLocale } from 'next-intl';

export function Price({
  iqd, usd, compareIQD, compareUSD, className,
}: {
  iqd: number; usd: number; compareIQD?: number | null; compareUSD?: number | null; className?: string;
}) {
  const currency = useCart((s) => s.currency);
  const locale = useLocale() as 'ar' | 'en';
  const value = currency === 'IQD' ? fmtNumber(iqd) : usd.toFixed(2);
  const label = currency === 'IQD' ? (locale === 'ar' ? 'د.ع' : 'IQD') : '$';
  const cmpVal = compareIQD && compareUSD
    ? (currency === 'IQD' ? fmtNumber(compareIQD) : (compareUSD as number).toFixed(2))
    : null;
  return (
    <span className={className}>
      <span className="text-fg">{label}</span>{' '}
      <span className="num">{value}</span>
      {cmpVal && (
        <span className="ml-2 text-fg-tertiary line-through text-xs rtl:mr-2 rtl:ml-0 num">{cmpVal}</span>
      )}
    </span>
  );
}
