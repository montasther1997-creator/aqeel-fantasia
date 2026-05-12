'use client';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

/**
 * AdaptiveShell:
 * - Mobile (< 768px): phone-like full viewport with mobile chrome
 * - Desktop (>= 768px): full-width editorial layout
 *
 * Theme: defaults to user preference from localStorage; falls back to `mode` prop.
 * Mirrors `data-mode` to <html> so global CSS reacts even before this client component hydrates
 * (the layout.tsx inline script already sets html.dataset.mode pre-hydration).
 */
export function PhoneShell({
  children,
  mode: defaultMode = 'dark',
  accent = 'champagne',
}: { children: React.ReactNode; mode?: 'dark' | 'light'; accent?: string }) {
  const locale = useLocale();
  const [mode, setMode] = useState<'dark' | 'light'>(defaultMode);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fantasia-theme') as 'dark' | 'light' | null;
      const initial = saved || defaultMode;
      setMode(initial);
      document.documentElement.dataset.mode = initial;
    } catch {
      // localStorage may be unavailable (SSR, privacy mode) — fall back to defaultMode.
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'fantasia-theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
        setMode(e.newValue);
        document.documentElement.dataset.mode = e.newValue;
      }
    };
    window.addEventListener('storage', onStorage);

    // Same-tab updates: poll the data-mode set by the settings toggle.
    const observer = new MutationObserver(() => {
      const next = document.documentElement.dataset.mode;
      if (next === 'dark' || next === 'light') setMode(next);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

    return () => {
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
    };
  }, [defaultMode]);

  return (
    <div
      className="atelier-shell min-h-screen"
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      data-mode={mode}
      data-accent={accent}
    >
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
