'use client';
import { Link, usePathname } from '@/i18n/routing';
import { Icon } from './icons';
import { useTranslations } from 'next-intl';

export function BottomNav() {
  const t = useTranslations('nav');
  const path = usePathname();
  const isActive = (p: string) => path === p || (p !== '/' && path.startsWith(p));

  // Hide on welcome/auth
  if (path === '/' || path === '/auth') return null;

  const tabs = [
    { href: '/home', icon: 'home', label: t('home'), key: 'home' },
    { href: '/collections', icon: 'grid', label: t('collections'), key: 'collections' },
    { href: '/search', icon: 'search', label: t('search'), key: 'search' },
    { href: '/saved', icon: 'heart', label: t('saved'), key: 'saved' },
    { href: '/profile', icon: 'user', label: t('profile'), key: 'profile' },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-bg/95 backdrop-blur-xl border-t border-border h-[68px] flex items-stretch justify-around px-2 pb-3">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href as any}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${isActive(tab.href) ? 'text-fg' : 'text-fg-tertiary'}`}
        >
          <Icon name={tab.icon as any} size={tab.key === 'search' ? 22 : 20} />
          <span className="text-[9px] tracking-[0.08em] uppercase">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
