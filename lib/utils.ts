import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIQD(value: number, locale: 'ar' | 'en' = 'ar') {
  const v = Math.round(value).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-US');
  return locale === 'ar' ? `${v} د.ع` : `IQD ${v}`;
}

export function formatUSD(value: number, locale: 'ar' | 'en' = 'ar') {
  return `$${value.toFixed(2)}`;
}

export function formatPrice(iqd: number, usd: number, currency: 'IQD' | 'USD', locale: 'ar' | 'en' = 'ar') {
  return currency === 'IQD' ? formatIQD(iqd, locale) : formatUSD(usd, locale);
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
