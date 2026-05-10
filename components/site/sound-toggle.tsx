'use client';
import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { startAmbient, stopAmbient, playHover } from '@/lib/sound';

export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    // Attach hover sounds to all buttons/links once ambient is on
    const handler = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t && (t.closest('button') || t.closest('a'))) playHover();
    };
    document.addEventListener('mouseover', handler, { passive: true });
    return () => document.removeEventListener('mouseover', handler);
  }, [on]);

  const toggle = () => {
    if (on) { stopAmbient(); setOn(false); }
    else { startAmbient(); setOn(true); }
  };

  return (
    <button
      onClick={toggle}
      aria-label="sound"
      className="fixed bottom-5 right-5 rtl:left-5 rtl:right-auto z-40 w-10 h-10 grid place-items-center glass-strong rounded-full text-muted hover:text-frost transition-colors"
    >
      {on ? <Volume2 className="w-4 h-4 text-electric" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
}
