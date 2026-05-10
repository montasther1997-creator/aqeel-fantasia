import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        onyx: '#0A0A0A',
        pearl: '#F6F4EF',
        ash: '#1A1A1A',
        smoke: '#E8E4DD',
        champagne: '#C9A961',
        graphite: '#2C2C2C',
        mist: '#8E8A82',
        bone: '#DCD7CC',
        sand: '#B8A88A',
        burgundy: '#5C1E1E',
        forest: '#243B2A',
        indigo: '#1F2742',
        // semantic aliases
        bg: 'var(--bg)',
        'bg-elevated': 'var(--bg-elevated)',
        fg: 'var(--fg)',
        'fg-secondary': 'var(--fg-secondary)',
        'fg-tertiary': 'var(--fg-tertiary)',
        border: 'var(--border)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        serif: ['var(--serif)'],
        sans: ['var(--sans)'],
        'serif-ar': ['var(--serif-ar)'],
        'sans-ar': ['var(--sans-ar)'],
        signature: ['var(--signature)'],
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.65, 0, 0.35, 1)',
        reveal: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
