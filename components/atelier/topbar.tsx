'use client';
import { Link, useRouter } from '@/i18n/routing';
import { Icon } from './icons';
import { Crest } from './crest';
import { useCart } from '@/lib/cart-store';

export function TopBar({ transparent = false, leftIcon = 'menu', onLeft, hideRight = false }: { transparent?: boolean; leftIcon?: 'menu' | 'chevronL' | 'close'; onLeft?: () => void; hideRight?: boolean }) {
  const router = useRouter();
  const count = useCart((s) => s.items.reduce((n, x) => n + x.qty, 0));
  const handleLeft = onLeft || (() => router.back());
  return (
    <div className={`md:hidden h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 z-10 ${transparent ? 'bg-transparent border-transparent absolute inset-x-0' : 'bg-bg'}`}>
      <button onClick={handleLeft} aria-label="back" className="w-8 h-8 grid place-items-center text-fg">
        <Icon name={leftIcon} size={20} />
      </button>
      <Link href={'/home' as any} className="text-fg">
        <Crest size={28} />
      </Link>
      {!hideRight ? (
        <Link href={'/bag' as any} className="w-8 h-8 grid place-items-center text-fg relative" aria-label="bag">
          <Icon name="bag" size={20} />
          {count > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-accent" />
          )}
        </Link>
      ) : <div className="w-8" />}
    </div>
  );
}
