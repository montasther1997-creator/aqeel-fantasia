'use client';
import { useEffect, useRef, useState } from 'react';

type AmbientConfig = {
  enabled: boolean;
  type: 'motes' | 'fabric' | 'lines' | 'rich' | 'off';
  intensity: number;
};

/**
 * Always-on ambient layer. Rendered ABOVE page content via z-[60] +
 * mix-blend-mode: screen so the silk waves stay visible even over
 * dark hero images or solid section backgrounds. pointer-events:none
 * lets clicks pass through.
 */
export function AmbientBackground({ initial }: { initial: AmbientConfig }) {
  const [cfg] = useState<AmbientConfig>(initial);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cfg.enabled || cfg.type === 'off') return;

    let lastY = window.scrollY;
    let lastTs = performance.now();
    let raf = 0;
    let velocity = 0;

    const tick = () => {
      velocity *= 0.92;
      const clamped = Math.max(-1, Math.min(1, velocity / 30));
      document.documentElement.style.setProperty('--scroll-pulse', String(Math.abs(clamped)));
      document.documentElement.style.setProperty('--scroll-dir', clamped >= 0 ? '1' : '-1');
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastY;
      const dt = Math.max(1, now - lastTs);
      velocity = (dy / dt) * 16;
      lastY = window.scrollY;
      lastTs = now;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      document.documentElement.style.removeProperty('--scroll-pulse');
      document.documentElement.style.removeProperty('--scroll-dir');
    };
  }, [cfg.enabled, cfg.type]);

  if (!cfg.enabled || cfg.type === 'off') return null;

  if (cfg.type === 'motes') return (
    <div className="ambient-overlay">
      <MotesLayer intensity={cfg.intensity} />
      <ScrollTrail intensity={cfg.intensity} />
    </div>
  );
  if (cfg.type === 'lines') return (
    <div className="ambient-overlay">
      <LinesLayer intensity={cfg.intensity} />
      <ScrollTrail intensity={cfg.intensity} />
    </div>
  );

  return (
    <div ref={rootRef} className="ambient-overlay">
      <FabricWaves intensity={cfg.intensity} />
      <FabricGrain intensity={cfg.intensity} />
      <MotesLayer intensity={cfg.intensity * 0.85} />
      <ScissorSweep intensity={cfg.intensity} />
      <ScrollTrail intensity={cfg.intensity} />
    </div>
  );
}

/* FABRIC WAVES — high-opacity silk overlaid via screen blend */
function FabricWaves({ intensity }: { intensity: number }) {
  // bumped from 0.05-0.2 to 0.25-0.6 for visibility above dark hero sections
  const baseOpacity = Math.max(0.25, Math.min(0.6, intensity * 0.7));
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden silk-root">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="silkGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C9A961" stopOpacity="0" />
            <stop offset="50%" stopColor="#C9A961" stopOpacity={baseOpacity} />
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="silkGrad2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A961" stopOpacity="0" />
            <stop offset="50%" stopColor="#C9A961" stopOpacity={baseOpacity * 0.8} />
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="silkGrad3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C9A961" stopOpacity="0" />
            <stop offset="50%" stopColor="#C9A961" stopOpacity={baseOpacity * 0.65} />
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path fill="url(#silkGrad1)">
          <animate
            attributeName="d"
            dur="14s"
            repeatCount="indefinite"
            values="
              M-100,200 C200,140 480,260 760,180 C1040,100 1320,240 1540,160 L1540,0 L-100,0 Z;
              M-100,180 C200,260 480,160 760,240 C1040,320 1320,180 1540,260 L1540,0 L-100,0 Z;
              M-100,220 C200,160 480,300 760,200 C1040,100 1320,260 1540,140 L1540,0 L-100,0 Z;
              M-100,200 C200,140 480,260 760,180 C1040,100 1320,240 1540,160 L1540,0 L-100,0 Z
            "
          />
        </path>

        <path fill="url(#silkGrad2)">
          <animate
            attributeName="d"
            dur="20s"
            repeatCount="indefinite"
            values="
              M-100,500 C300,420 600,560 900,480 C1180,400 1380,540 1540,460 L1540,900 L-100,900 Z;
              M-100,520 C300,580 600,460 900,540 C1180,620 1380,480 1540,560 L1540,900 L-100,900 Z;
              M-100,480 C300,400 600,580 900,460 C1180,340 1380,520 1540,420 L1540,900 L-100,900 Z;
              M-100,500 C300,420 600,560 900,480 C1180,400 1380,540 1540,460 L1540,900 L-100,900 Z
            "
          />
        </path>

        <path fill="url(#silkGrad3)">
          <animate
            attributeName="d"
            dur="26s"
            repeatCount="indefinite"
            values="
              M-100,750 C300,700 600,820 900,740 C1180,660 1380,800 1540,720 L1540,900 L-100,900 Z;
              M-100,770 C300,840 600,700 900,800 C1180,880 1380,720 1540,820 L1540,900 L-100,900 Z;
              M-100,730 C300,680 600,840 900,720 C1180,600 1380,780 1540,680 L1540,900 L-100,900 Z;
              M-100,750 C300,700 600,820 900,740 C1180,660 1380,800 1540,720 L1540,900 L-100,900 Z
            "
          />
        </path>
      </svg>
    </div>
  );
}

function FabricGrain({ intensity }: { intensity: number }) {
  const opacity = Math.max(0.04, Math.min(0.12, intensity * 0.14));
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

function MotesLayer({ intensity }: { intensity: number }) {
  // bumped base opacity from 0.06-0.28 to 0.3-0.7
  const opacityBase = Math.max(0.3, Math.min(0.7, intensity * 0.75));
  const motes = Array.from({ length: 22 }).map((_, i) => {
    const seed = i + 1;
    return {
      left: (seed * 73) % 100,
      top: (seed * 41) % 100,
      delay: (seed * 1.7) % 14,
      duration: 14 + (seed % 10),
      size: 2 + (seed % 4),
    };
  });
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden motes-root">
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full mote"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            background: '#C9A961',
            opacity: opacityBase,
            animation: `mote-drift ${m.duration}s ease-in-out ${m.delay}s infinite`,
            boxShadow: `0 0 ${m.size * 8}px #C9A961`,
            ['--mote-base' as any]: opacityBase,
          }}
        />
      ))}
    </div>
  );
}

function ScissorSweep({ intensity }: { intensity: number }) {
  const peakOpacity = Math.max(0.3, Math.min(0.7, intensity * 0.75));
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
      <span
        className="absolute scissor-blade"
        style={{
          top: '-20%',
          left: '-20%',
          width: '140%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #C9A961 30%, #C9A961 70%, transparent 100%)',
          transform: 'rotate(-12deg)',
          transformOrigin: 'left center',
          opacity: 0,
          boxShadow: `0 0 26px #C9A961`,
          ['--scissor-peak' as any]: peakOpacity,
        }}
      />
    </div>
  );
}

function ScrollTrail({ intensity }: { intensity: number }) {
  const peak = Math.max(0.4, Math.min(1, intensity));
  return (
    <div aria-hidden className="fixed top-0 inset-x-0 pointer-events-none h-px overflow-visible">
      <span
        className="block h-px scroll-trail"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #C9A961 50%, transparent 100%)',
          ['--trail-peak' as any]: peak,
        }}
      />
    </div>
  );
}

function LinesLayer({ intensity }: { intensity: number }) {
  const opacity = Math.max(0.15, Math.min(0.4, intensity * 0.45));
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
      {[12, 32, 55, 78].map((top, i) => (
        <span
          key={i}
          className="absolute h-px gold-line"
          style={{
            left: '-10%',
            right: '-10%',
            top: `${top}%`,
            background: '#C9A961',
            opacity,
            animation: `line-drift ${22 + i * 4}s ease-in-out ${i * 2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
