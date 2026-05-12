'use client';
import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Crest } from './crest';
import { Icon } from './icons';
import { useCart } from '@/lib/cart-store';

export function DesktopNav({
  enable3d = true,
  intensity = 0.5,
}: {
  enable3d?: boolean;
  intensity?: number;
}) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const path = usePathname();
  const isAr = locale === 'ar';
  const [scrolled, setScrolled] = useState(false);
  const count = useCart((s) => s.items.reduce((n, x) => n + x.qty, 0));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 3D-prominent shadow strength when scrolled (admin-controlled intensity).
  const i = Math.max(0, Math.min(1, intensity));
  const elevatedStyle = scrolled && enable3d
    ? {
        boxShadow: `0 4px 24px rgba(201,169,97,${0.08 + 0.15 * i}), 0 1px 0 rgba(201,169,97,${0.1 + 0.25 * i}) inset`,
        borderBottom: `1px solid rgba(201,169,97,${0.15 + 0.25 * i})`,
        transform: 'translateY(0)',
      }
    : undefined;

  const links = [
    { href: '/home', label: t('home') },
    { href: '/collections', label: t('collections') },
    { href: '/bespoke', label: isAr ? 'مفصّل' : 'Bespoke' },
  ];

  // Hide on welcome/auth screens
  const hideOnRoutes = ['/', '/auth'];
  if (hideOnRoutes.includes(path)) return null;

  return (
    <header
      className={`hidden md:block fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? 'bg-bg/95 backdrop-blur-xl' : 'bg-transparent'}`}
      style={elevatedStyle}
    >
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Left: nav links */}
        <nav className="flex items-center gap-10">
          {links.map((l) => (
            <Link key={l.href} href={l.href as any} className={`text-[11px] tracking-[0.25em] uppercase transition-colors ${path === l.href ? 'text-fg' : 'text-fg-tertiary hover:text-fg'}`} style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Center: brand */}
        <Link href={'/home' as any} className="flex items-center gap-3">
          <Crest size={32} />
          <div className="hidden lg:block">
            <div className="text-[9px] tracking-[0.3em] text-fg-tertiary">{isAr ? 'دار' : 'MAISON'}</div>
            <div className="serif text-base leading-tight" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
              {isAr ? 'عقيل فنتازيا' : 'Aqeel Fantasia'}
            </div>
          </div>
        </Link>

        {/* Right: utilities */}
        <div className="flex items-center gap-5">
          <Link href={'/search' as any} aria-label="search" className="text-fg-tertiary hover:text-fg transition-colors">
            <Icon name="search" size={18} />
          </Link>
          <Link href={'/profile' as any} aria-label="account" className="text-fg-tertiary hover:text-fg transition-colors">
            <Icon name="user" size={18} />
          </Link>
          <Link href={'/saved' as any} aria-label="saved" className="text-fg-tertiary hover:text-fg transition-colors">
            <Icon name="heart" size={18} />
          </Link>
          <Link href={'/bag' as any} aria-label="bag" className="text-fg-tertiary hover:text-fg transition-colors relative">
            <Icon name="bag" size={18} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 rtl:-left-2 rtl:right-auto bg-accent text-onyx text-[9px] font-medium num w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {/* Lang switch */}
          <Link href={(path || '/home') as any} locale={isAr ? 'en' : 'ar'} className="text-[10px] tracking-[0.16em] uppercase text-fg-tertiary hover:text-fg border-l border-border pl-5 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-5" style={isAr ? { letterSpacing: 0 } : {}}>
            {isAr ? 'EN' : 'العربية'}
          </Link>
        </div>
      </div>
    </header>
  );
}
