'use client';
import { useLocale } from 'next-intl';

/**
 * AdaptiveShell:
 * - Mobile (< 768px): phone-like full viewport with mobile chrome
 * - Desktop (>= 768px): full-width editorial layout
 */
export function PhoneShell({ children, mode = 'dark', accent = 'champagne' }: { children: React.ReactNode; mode?: 'dark' | 'light'; accent?: string }) {
  const locale = useLocale();
  return (
    <div className="atelier-shell min-h-screen" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} data-mode={mode} data-accent={accent}>
      {children}
    </div>
  );
}

export function StatusBar() {
  // Hidden on desktop; only shown on mobile via CSS
  return (
    <div className="status-bar md:hidden">
      <span className="num">9:41</span>
      <span className="icons">
        <svg viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="6" width="3" height="6"/><rect x="4" y="4" width="3" height="8"/><rect x="8" y="2" width="3" height="10"/><rect x="12" y="0" width="3" height="12"/></svg>
        <svg viewBox="0 0 18 12" fill="currentColor"><path d="M9 2C5 2 2 4 0 6l9 6 9-6c-2-2-5-4-9-4z"/></svg>
        <svg viewBox="0 0 24 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="2" stroke="currentColor"/><rect x="3" y="3" width="14" height="6" fill="currentColor"/><rect x="22" y="4" width="2" height="4" fill="currentColor"/></svg>
      </span>
    </div>
  );
}
