'use client';
/**
 * Brand crest — inline SVG so we don't depend on PNG asset.
 * Editorial: a vertical bar with serif "A" and stars, simplified.
 * Renders in current color (use color via parent or filter).
 */
export function Crest({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      {/* Outer frame */}
      <rect x="14" y="6" width="36" height="52" />
      {/* Stars top */}
      <g fill="currentColor" stroke="none">
        <circle cx="22" cy="14" r="1" />
        <circle cx="32" cy="14" r="1" />
        <circle cx="42" cy="14" r="1" />
      </g>
      {/* Letter A */}
      <text x="32" y="40" textAnchor="middle" fontFamily="serif" fontSize="22" fill="currentColor" stroke="none" fontStyle="italic">A</text>
      {/* Bottom line */}
      <line x1="20" y1="50" x2="44" y2="50" />
      {/* Bottom ornament */}
      <g fill="currentColor" stroke="none">
        <circle cx="32" cy="54" r="1.2" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`leading-tight ${className}`}>
      <div className="text-[9px] tracking-[0.3em] text-fg-tertiary">AQEEL</div>
      <div className="serif text-base">FANTASIA</div>
    </div>
  );
}
