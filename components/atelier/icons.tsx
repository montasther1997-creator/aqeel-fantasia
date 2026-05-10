type IconName = 'home' | 'grid' | 'search' | 'bag' | 'user' | 'heart' | 'menu' | 'close' | 'chevronR' | 'chevronL' | 'chevronD' | 'plus' | 'minus' | 'check' | 'arrowR' | 'arrowL' | 'share' | 'settings';

export function Icon({ name, size = 22, className = '' }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
    grid: <g><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></g>,
    search: <g><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></g>,
    bag: <g><path d="M6 7h12l-1.5 12.5a2 2 0 01-2 1.5h-5a2 2 0 01-2-1.5L6 7zM9 7V5a3 3 0 016 0v2" /></g>,
    user: <g><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></g>,
    heart: <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 4 23.5 8 21.5 12 19 16.5 12 21 12 21z" />,
    menu: <g><path d="M3 6h18M3 12h18M3 18h18" /></g>,
    close: <g><path d="M6 6l12 12M18 6L6 18" /></g>,
    chevronR: <path d="M9 6l6 6-6 6" />,
    chevronL: <path d="M15 6l-6 6 6 6" />,
    chevronD: <path d="M6 9l6 6 6-6" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    check: <path d="M5 12l4 4L19 6" />,
    arrowR: <g><path d="M5 12h14M13 6l6 6-6 6" /></g>,
    arrowL: <g><path d="M19 12H5M11 18l-6-6 6-6" /></g>,
    share: <g><path d="M4 12l8-8 8 8M12 4v16" /></g>,
    settings: <g><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1.04 1.56V21a2 2 0 01-4 0v-.09A1.7 1.7 0 008.9 19.4a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.56-1.04H3a2 2 0 010-4h.09A1.7 1.7 0 004.6 8.9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 012.83-2.83l.06.06a1.7 1.7 0 001.87.34H9a1.7 1.7 0 001.04-1.56V3a2 2 0 014 0v.09a1.7 1.7 0 001.04 1.56 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 012.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V9a1.7 1.7 0 001.56 1.04H21a2 2 0 010 4h-.09a1.7 1.7 0 00-1.56 1.04z" /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.25" strokeLinecap="square" strokeLinejoin="miter" className={className}>
      {paths[name]}
    </svg>
  );
}
