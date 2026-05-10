import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0A',
          secondary: '#111111',
          tertiary: '#1A1A1A',
          elevated: '#222222',
        },
        chrome: '#C0C0C8',
        frost: '#F4F4F6',
        blood: '#8B0000',
        electric: '#0066FF',
        neon: 'rgba(0,102,255,0.4)',
        line: 'rgba(255,255,255,0.08)',
        muted: '#8A8A8F',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Bebas Neue', 'Anton', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'IBM Plex Arabic', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        cinematic: '0.18em',
        wider2: '0.25em',
      },
      boxShadow: {
        glow: '0 0 40px rgba(0,102,255,0.25)',
        'glow-red': '0 0 40px rgba(139,0,0,0.4)',
        chrome: '0 0 30px rgba(192,192,200,0.15)',
        elevated: '0 30px 80px -20px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        'cinematic': 'radial-gradient(ellipse at top, rgba(0,102,255,0.08), transparent 60%), radial-gradient(ellipse at bottom, rgba(139,0,0,0.06), transparent 60%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 1s cubic-bezier(0.22,1,0.36,1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(40px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glowPulse: { '0%,100%': { boxShadow: '0 0 20px rgba(0,102,255,0.2)' }, '50%': { boxShadow: '0 0 60px rgba(0,102,255,0.5)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};

export default config;
