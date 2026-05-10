'use client';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { Icon } from './icons';
import { Crest } from './crest';
import { useCart } from '@/lib/cart-store';

export function TopBar({ transparent = false, leftIcon = 'menu', onLeft, hideRight = false }: { transparent?: boolean; leftIcon?: 'menu' | 'chevronL' | 'close'; onLeft?: () => void; hideRight?: boolean }) {
  const router = useRouter();
  const count = useCart((s) => s.items.reduce((n, x) => n + x.qty, 0));
  const handleLeft = onLeft || (() => router.back());
  return (
    <div className={`topbar ${transparent ? 'transparent' : ''}`}>
      <button className="icon-btn" onClick={handleLeft} aria-label="back">
        <Icon name={leftIcon} size={20} />
      </button>
      <Link href={'/' as any} className="text-fg">
        <Crest size={28} />
      </Link>
      {!hideRight ? (
        <Link href={'/bag' as any} className="icon-btn relative" aria-label="bag">
          <Icon name="bag" size={20} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto w-2 h-2 rounded-full bg-accent" />
          )}
        </Link>
      ) : <div className="w-8" />}
    </div>
  );
}
