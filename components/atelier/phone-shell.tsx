'use client';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

/**
 * PhoneShell wraps every screen.
 * - On mobile (<768px): becomes the full viewport
 * - On desktop: shows as a 390x844 phone with bezel, centered on stage background
 */
export function PhoneShell({ children, mode = 'dark', accent = 'champagne' }: { children: React.ReactNode; mode?: 'dark' | 'light'; accent?: string }) {
  const locale = useLocale();
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 769);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className={isDesktop ? 'stage-bg flex items-center justify-center py-12 lg:py-20' : ''} data-mode={mode} data-accent={accent}>
      <div className="phone-shell" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} data-mode={mode} data-accent={accent}>
        {children}
      </div>
    </div>
  );
}

export function StatusBar({ time = '9:41' }: { time?: string }) {
  return (
    <div className="status-bar">
      <span className="num">{time}</span>
      <span className="icons">
        <svg viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="6" width="3" height="6"/><rect x="4" y="4" width="3" height="8"/><rect x="8" y="2" width="3" height="10"/><rect x="12" y="0" width="3" height="12"/></svg>
        <svg viewBox="0 0 18 12" fill="currentColor"><path d="M9 2C5 2 2 4 0 6l9 6 9-6c-2-2-5-4-9-4z"/></svg>
        <svg viewBox="0 0 24 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="2" stroke="currentColor"/><rect x="3" y="3" width="14" height="6" fill="currentColor"/><rect x="22" y="4" width="2" height="4" fill="currentColor"/></svg>
      </span>
    </div>
  );
}
