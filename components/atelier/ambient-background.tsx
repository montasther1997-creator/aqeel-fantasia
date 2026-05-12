'use client';
import { useEffect, useRef, useState } from 'react';

type AmbientConfig = {
  enabled: boolean;
  type: 'motes' | 'fabric' | 'lines' | 'rich' | 'off';
  intensity: number;
};

/**
 * Always-on ambient layer behind the entire site.
 *
 * - Continuous: silk waves, drifting motes, occasional scissor sweep.
 * - Scroll-reactive: an extra gold "trail" pulses on every scroll up
 *   or down, and motes briefly accelerate. So motion is visible both
 *   when idle AND when the user scrolls.
 */
export function AmbientBackground({ initial }: { initial: AmbientConfig }) {
  const [cfg] = useState<AmbientConfig>(initial);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Scroll velocity → CSS variable on documentElement
  useEffect(() => {
    if (!cfg.enabled || cfg.type === 'off') return;

    let lastY = window.scrollY;
    let lastTs = performance.now();
    let raf = 0;
    let velocity = 0;

    const tick = () => {
      // decay every frame
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
      velocity = (dy / dt) * 16; // normalize to ~per-frame
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
    <>
      <MotesLayer intensity={cfg.intensity} />
      <ScrollTrail intensity={cfg.intensity} />
    </>
  );
  if (cfg.type === 'lines') return (
    <>
      <LinesLayer intensity={cfg.intensity} />
      <ScrollTrail intensity={cfg.intensity} />
    </>
  );

  // 'fabric' and 'rich' both render the silk wave + grain; 'rich' adds motes + sweep
  return (
    <div ref={rootRef}>
      <FabricWaves intensity={cfg.intensity} />
      <FabricGrain intensity={cfg.intensity} />
      <MotesLayer intensity={cfg.intensity * 0.85} />
      <ScissorSweep intensity={cfg.intensity} />
      <ScrollTrail intensity={cfg.intensity} />
    </div>
  );
}

/* ============================================================
 * FABRIC WAVES — silk-like SVG curves that breathe. Faster when
 * the user scrolls (CSS animation-play-state stays running, but
 * we boost opacity via --scroll-pulse).
 * ============================================================ */
function FabricWaves({ intensity }: { intensity: number }) {
  const baseOpacity = Math.max(0.05, Math.min(0.2, intensity * 0.2));
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden silk-root">
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
            <stop offset="50%" stopColor="#C9A961" stopOpacity={baseOpacity * 0.7} />
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="silkGrad3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C9A961" stopOpacity="0" />
            <stop offset="50%" stopColor="#C9A961" stopOpacity={baseOpacity * 0.55} />
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Wave 1 — top fabric ribbon */}
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

        {/* Wave 2 — middle fabric */}
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

        {/* Wave 3 — bottom flowing accent */}
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
      <style>{`
        .silk-root {
          /* boost overall fabric glow proportional to scroll velocity */
          filter: brightness(calc(1 + var(--scroll-pulse, 0) * 0.4)) saturate(calc(1 + var(--scroll-pulse, 0) * 0.5));
          transition: filter 200ms ease-out;
        }
      `}</style>
    </div>
  );
}

/* ============================================================
 * FABRIC GRAIN — paper/silk texture for tactile feel
 * ============================================================ */
function FabricGrain({ intensity }: { intensity: number }) {
  const opacity = Math.max(0.025, Math.min(0.07, intensity * 0.07));
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        mixBlendMode: 'overlay',
      }}
    />
  );
}

/* ============================================================
 * MOTES — floating gold particles that drift continuously and
 * jolt slightly on scroll.
 * ============================================================ */
function MotesLayer({ intensity }: { intensity: number }) {
  const opacityBase = Math.max(0.06, Math.min(0.28, intensity * 0.3));
  const motes = Array.from({ length: 18 }).map((_, i) => {
    const seed = i + 1;
    return {
      left: (seed * 73) % 100,
      top: (seed * 41) % 100,
      delay: (seed * 1.7) % 14,
      duration: 14 + (seed % 10),
      size: 1.5 + (seed % 3),
    };
  });
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden motes-root">
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-accent mote"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            opacity: opacityBase,
            animation: `mote-drift ${m.duration}s ease-in-out ${m.delay}s infinite`,
            boxShadow: `0 0 ${m.size * 6}px var(--accent)`,
          }}
        />
      ))}
      <style>{`
        @keyframes mote-drift {
          0%, 100% { transform: translate(0, 0); opacity: ${opacityBase}; }
          25% { transform: translate(${intensity * 50}px, ${-intensity * 35}px); opacity: ${opacityBase * 1.6}; }
          50% { transform: translate(${-intensity * 30}px, ${intensity * 45}px); opacity: ${opacityBase * 0.7}; }
          75% { transform: translate(${intensity * 20}px, ${intensity * 25}px); opacity: ${opacityBase * 1.3}; }
        }
        .motes-root .mote {
          /* on scroll, motes brighten + nudge in scroll direction */
          filter: brightness(calc(1 + var(--scroll-pulse, 0) * 0.8));
          transform: translateY(calc(var(--scroll-pulse, 0) * var(--scroll-dir, 1) * -10px)) !important;
          transition: filter 220ms ease-out, transform 320ms ease-out;
        }
      `}</style>
    </div>
  );
}

/* ============================================================
 * SCISSOR SWEEP — a thin diagonal gold blade crosses the screen
 * every ~22 seconds.
 * ============================================================ */
function ScissorSweep({ intensity }: { intensity: number }) {
  const peakOpacity = Math.max(0.05, Math.min(0.28, intensity * 0.32));
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <span
        className="absolute"
        style={{
          top: '-20%',
          left: '-20%',
          width: '140%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%)',
          transform: 'rotate(-12deg)',
          transformOrigin: 'left center',
          opacity: 0,
          animation: `scissor-sweep 22s ease-in-out infinite`,
          boxShadow: `0 0 20px var(--accent)`,
        }}
      />
      <style>{`
        @keyframes scissor-sweep {
          0%, 30% { opacity: 0; transform: rotate(-12deg) translateY(-200px); }
          45% { opacity: ${peakOpacity}; transform: rotate(-12deg) translateY(40vh); }
          60% { opacity: 0; transform: rotate(-12deg) translateY(110vh); }
          100% { opacity: 0; transform: rotate(-12deg) translateY(110vh); }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
 * SCROLL TRAIL — a horizontal gold bar at the top edge that
 * gets brighter / longer as scroll velocity rises. Visible at
 * any time the user is actively scrolling (up or down).
 * ============================================================ */
function ScrollTrail({ intensity }: { intensity: number }) {
  const peak = Math.max(0.3, Math.min(0.85, intensity));
  return (
    <div aria-hidden className="fixed top-0 inset-x-0 pointer-events-none z-[5] h-px overflow-visible">
      <span
        className="block h-px scroll-trail"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)',
        }}
      />
      <style>{`
        .scroll-trail {
          width: calc(20% + var(--scroll-pulse, 0) * 80%);
          margin: 0 auto;
          opacity: calc(var(--scroll-pulse, 0) * ${peak});
          box-shadow: 0 0 calc(var(--scroll-pulse, 0) * 18px) var(--accent);
          transition: width 250ms ease-out, opacity 220ms ease-out;
        }
      `}</style>
    </div>
  );
}

/* ============================================================
 * LINES — drifting thin gold rules
 * ============================================================ */
function LinesLayer({ intensity }: { intensity: number }) {
  const opacity = Math.max(0.05, Math.min(0.16, intensity * 0.16));
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[12, 32, 55, 78].map((top, i) => (
        <span
          key={i}
          className="absolute h-px bg-accent"
          style={{
            left: '-10%',
            right: '-10%',
            top: `${top}%`,
            opacity,
            animation: `line-drift ${22 + i * 4}s ease-in-out ${i * 2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes line-drift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(${intensity * 60}px); }
        }
      `}</style>
    </div>
  );
}
