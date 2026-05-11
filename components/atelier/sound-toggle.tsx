'use client';
import { useEffect, useState } from 'react';
import { initSound, setSoundEnabled, isSoundEnabled, playFabric, playWood } from '@/lib/sound';

export function SoundToggle() {
  const [on, setOn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initSound();
    setOn(isSoundEnabled());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!on || !mounted) return;
    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement)?.closest('[data-sound="hover"], a.pcard, .pcard');
      if (t) playFabric(0.04);
    };
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement)?.closest('button, a, [data-sound="click"]');
      if (t) playWood(0.06);
    };
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('click', onClick, { passive: true });
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('click', onClick);
    };
  }, [on, mounted]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    setSoundEnabled(next);
    if (next) playWood(0.08);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={on ? 'Mute sound' : 'Unmute sound'}
      className="fixed bottom-5 right-5 rtl:left-5 rtl:right-auto z-40 w-11 h-11 grid place-items-center rounded-full bg-bg/80 backdrop-blur-xl border border-border hover:border-accent transition-all hover:scale-105 group"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={on ? 'text-accent' : 'text-fg-tertiary'}>
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        {on ? (
          <>
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
            <circle cx="20" cy="20" r="1.5" fill="currentColor" stroke="none" className="animate-pulse" />
          </>
        ) : (
          <>
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        )}
      </svg>
    </button>
  );
}
