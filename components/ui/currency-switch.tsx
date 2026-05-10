'use client';
import { useCart } from '@/lib/cart-store';
import { cn } from '@/lib/utils';

export function CurrencySwitch({ className }: { className?: string }) {
  const currency = useCart((s) => s.currency);
  const setCurrency = useCart((s) => s.setCurrency);
  return (
    <div className={cn('inline-flex items-center text-[10px] tracking-cinematic', className)}>
      <button
        onClick={() => setCurrency('IQD')}
        className={cn('px-2 py-1 transition-colors', currency === 'IQD' ? 'text-frost' : 'text-muted hover:text-frost')}
      >IQD</button>
      <span className="text-muted">/</span>
      <button
        onClick={() => setCurrency('USD')}
        className={cn('px-2 py-1 transition-colors', currency === 'USD' ? 'text-frost' : 'text-muted hover:text-frost')}
      >USD</button>
    </div>
  );
}
