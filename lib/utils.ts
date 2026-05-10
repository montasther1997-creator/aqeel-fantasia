import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Numbers are ALWAYS Latin per brand spec (even in Arabic UI).
 * Use Intl with 'en-US' for grouping, then wrap in .num span for direction.
 */
export function fmtNumber(value: number) {
  return Math.round(value).toLocaleString('en-US');
}

export function formatIQD(value: number, locale: 'ar' | 'en' = 'ar') {
  const n = fmtNumber(value);
  return locale === 'ar' ? `د.ع ${n}` : `IQD ${n}`;
}

export function formatUSD(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPrice(iqd: number, usd: number, currency: 'IQD' | 'USD', locale: 'ar' | 'en' = 'ar') {
  return currency === 'IQD' ? formatIQD(iqd, locale) : formatUSD(usd);
}

export function genOrderNumber() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FNT-${t}-${r}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
