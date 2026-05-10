'use client';
import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, ShoppingBag, User, Search } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { CurrencySwitch } from '@/components/ui/currency-switch';
import { SearchOverlay } from '@/components/site/search-overlay';
import { useCart } from '@/lib/cart-store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function SiteNav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = useCart((s) => s.items.reduce((n, x) => n + x.qty, 0));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [path]);

  const links = [
    { href: '/identity', label: t('identity') },
    { href: '/archive', label: t('archive') },
    { href: '/drops', label: t('drops') },
    { href: '/cult', label: t('cult') },
    { href: '/signal', label: t('signal') },
  ];

  const otherLocale = locale === 'ar' ? 'en' : 'ar';

  return (
    <>
      <header className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        scrolled ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-line' : 'bg-transparent'
      )}>
        <div className="container-x flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Logo mark className="text-frost" />
            <span className="font-display text-sm tracking-cinematic hidden sm:block">FANTASIA</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <Link key={l.href} href={l.href as any} className="text-xs tracking-cinematic uppercase text-muted hover:text-frost transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <SearchOverlay />
            <CurrencySwitch className="hidden md:flex" />
            <Link href={`/${otherLocale === 'ar' ? '' : ''}` as any} locale={otherLocale as any} className="text-[10px] tracking-cinematic uppercase text-muted hover:text-frost border border-line px-2 py-1">
              {otherLocale.toUpperCase()}
            </Link>
            <Link href={'/account' as any} className="text-muted hover:text-frost transition-colors hidden sm:block">
              <User className="w-4 h-4" />
            </Link>
            <Link href={'/cart' as any} className="text-muted hover:text-frost relative">
              <ShoppingBag className="w-4 h-4" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 rtl:-left-2 rtl:right-auto bg-electric text-frost text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </Link>
            <button onClick={() => setOpen(true)} className="lg:hidden text-frost">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-bg-primary/95 backdrop-blur-2xl"
          >
            <div className="container-x h-full flex flex-col">
              <div className="flex items-center justify-between h-16">
                <Logo mark className="text-frost" />
                <button onClick={() => setOpen(false)} className="text-frost"><X className="w-6 h-6" /></button>
              </div>
              <nav className="flex-1 flex flex-col justify-center gap-6">
                {links.map((l, i) => (
                  <motion.div key={l.href}
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link href={l.href as any} className="font-display text-5xl tracking-cinematic uppercase">
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-10 flex items-center gap-4 text-xs tracking-cinematic">
                  <CurrencySwitch />
                  <Link href={'/account' as any}>{t('account')}</Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
