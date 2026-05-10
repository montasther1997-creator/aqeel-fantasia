'use client';
import { useCart } from '@/lib/cart-store';
import { formatIQD, formatUSD } from '@/lib/utils';
import { useLocale } from 'next-intl';

export function Price({
  iqd, usd, compareIQD, compareUSD, className,
}: {
  iqd: number; usd: number; compareIQD?: number | null; compareUSD?: number | null; className?: string;
}) {
  const currency = useCart((s) => s.currency);
  const locale = useLocale() as 'ar' | 'en';
  const main = currency === 'IQD' ? formatIQD(iqd, locale) : formatUSD(usd, locale);
  const compare = compareIQD && compareUSD
    ? (currency === 'IQD' ? formatIQD(compareIQD, locale) : formatUSD(compareUSD, locale))
    : null;
  return (
    <span className={className}>
      <span className="text-frost">{main}</span>
      {compare && (
        <span className="ml-2 text-muted line-through text-xs rtl:mr-2 rtl:ml-0">{compare}</span>
      )}
    </span>
  );
}
