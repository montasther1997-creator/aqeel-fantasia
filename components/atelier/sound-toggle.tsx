'use client';
import { useEffect, useState } from 'react';
import { initSound, setSoundEnabled, isSoundEnabled, playWood } from '@/lib/sound';

/**
 * Sound toggle — only renders the toggle button.
 * Sound events are triggered IN-PLACE by individual components calling
 * playWood/playFabric/playDing/playBell directly. This avoids the
 * performance issue of attaching a global document mouseover listener.
 */
export function SoundToggle() {
  const [on, setOn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initSound();
    setOn(isSoundEnabled());
    setMounted(true);
  }, []);

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
      className="fixed bottom-5 right-5 rtl:left-5 rtl:right-auto z-40 w-11 h-11 grid place-items-center rounded-full bg-bg/80 backdrop-blur-xl border border-border hover:border-accent transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={on ? 'text-accent' : 'text-fg-tertiary'}>
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        {on ? (
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
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
