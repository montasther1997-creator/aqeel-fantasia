'use client';
import { Link, usePathname } from '@/i18n/routing';
import { Icon } from './icons';
import { useLocale, useTranslations } from 'next-intl';

export function BottomNav() {
  const t = useTranslations('nav');
  const path = usePathname();
  const isActive = (p: string) => path === p || (p !== '/' && path.startsWith(p));

  const tabs = [
    { href: '/', icon: 'home', label: t('home'), key: 'home' },
    { href: '/collections', icon: 'grid', label: t('collections'), key: 'collections' },
    { href: '/search', icon: 'search', label: t('search'), key: 'search' },
    { href: '/saved', icon: 'heart', label: t('saved'), key: 'saved' },
    { href: '/profile', icon: 'user', label: t('profile'), key: 'profile' },
  ] as const;

  return (
    <nav className="bottomnav">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href as any}
          className={`tab ${isActive(tab.href) ? 'active' : ''}`}
        >
          <Icon name={tab.icon as any} size={tab.key === 'search' ? 24 : 20} />
          <span className="label">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
