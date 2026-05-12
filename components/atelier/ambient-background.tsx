'use client';
import { useEffect, useState } from 'react';

type AmbientConfig = {
  enabled: boolean;
  type: 'motes' | 'fabric' | 'lines' | 'off';
  intensity: number;
};

/**
 * Quiet, always-on ambient layer behind the entire site. Reads admin settings
 * from /api/public/appearance (cached) and renders a subtle decoration:
 *  - motes: floating gold particles
 *  - fabric: noise/grain overlay
 *  - lines: thin gold rules drifting
 *  - off: nothing
 */
export function AmbientBackground({
  initial,
}: {
  initial: AmbientConfig;
}) {
  const [cfg] = useState<AmbientConfig>(initial);

  if (!cfg.enabled || cfg.type === 'off') return null;

  if (cfg.type === 'motes') return <MotesLayer intensity={cfg.intensity} />;
  if (cfg.type === 'fabric') return <FabricLayer intensity={cfg.intensity} />;
  if (cfg.type === 'lines') return <LinesLayer intensity={cfg.intensity} />;
  return null;
}

function MotesLayer({ intensity }: { intensity: number }) {
  const opacityBase = Math.max(0.02, Math.min(0.15, intensity * 0.15));
  // 12 motes with deterministic positions + animation delays
  const motes = Array.from({ length: 12 }).map((_, i) => {
    const seed = i + 1;
    return {
      left: ((seed * 73) % 100),
      top: ((seed * 41) % 100),
      delay: (seed * 1.7) % 12,
      duration: 12 + (seed % 8),
      size: 1 + (seed % 3),
    };
  });
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-accent"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            opacity: opacityBase,
            animation: `mote-drift ${m.duration}s ease-in-out ${m.delay}s infinite`,
            boxShadow: `0 0 ${m.size * 4}px var(--accent)`,
          }}
        />
      ))}
      <style>{`
        @keyframes mote-drift {
          0%, 100% { transform: translate(0, 0); opacity: ${opacityBase}; }
          25% { transform: translate(${intensity * 30}px, ${-intensity * 20}px); opacity: ${opacityBase * 1.4}; }
          50% { transform: translate(${-intensity * 20}px, ${intensity * 30}px); opacity: ${opacityBase * 0.6}; }
          75% { transform: translate(${intensity * 15}px, ${intensity * 15}px); opacity: ${opacityBase * 1.2}; }
        }
      `}</style>
    </div>
  );
}

function FabricLayer({ intensity }: { intensity: number }) {
  const opacity = Math.max(0.02, Math.min(0.08, intensity * 0.08));
  // SVG grain noise — very subtle paper/fabric texture
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

function LinesLayer({ intensity }: { intensity: number }) {
  const opacity = Math.max(0.03, Math.min(0.1, intensity * 0.1));
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[15, 35, 60, 82].map((top, i) => (
        <span
          key={i}
          className="absolute h-px bg-accent"
          style={{
            left: '-10%',
            right: '-10%',
            top: `${top}%`,
            opacity,
            animation: `line-drift ${20 + i * 4}s ease-in-out ${i * 2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes line-drift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(${intensity * 40}px); }
        }
      `}</style>
    </div>
  );
}
