'use client';
import { Link, usePathname } from '@/i18n/routing';
import { Icon } from './icons';
import { useTranslations } from 'next-intl';
import { useCart } from '@/lib/cart-store';

export function BottomNav() {
  const t = useTranslations('nav');
  const path = usePathname();
  const count = useCart((s) => s.items.reduce((n, x) => n + x.qty, 0));
  const isActive = (p: string) => path === p || (p !== '/' && path.startsWith(p));

  if (path === '/' || path === '/auth') return null;

  const tabs = [
    { href: '/home', icon: 'home', label: t('home'), key: 'home' },
    { href: '/collections', icon: 'grid', label: t('collections'), key: 'collections' },
    { href: '/bag', icon: 'bag', label: t('cart'), key: 'bag', badge: count },
    { href: '/saved', icon: 'heart', label: t('saved'), key: 'saved' },
    { href: '/profile', icon: 'user', label: t('profile'), key: 'profile' },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-bg/95 backdrop-blur-xl border-t border-border h-[68px] flex items-stretch justify-around px-2 pb-3">
      {tabs.map((tab: any) => (
        <Link
          key={tab.key}
          href={tab.href as any}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative ${isActive(tab.href) ? 'text-fg' : 'text-fg-tertiary'}`}
        >
          <div className="relative">
            <Icon name={tab.icon as any} size={20} />
            {tab.badge > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent text-onyx text-[9px] num w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {tab.badge}
              </span>
            )}
          </div>
          <span className="text-[9px] tracking-[0.08em] uppercase">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
