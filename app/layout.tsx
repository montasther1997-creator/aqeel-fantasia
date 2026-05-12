import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'AQEEL FANTASIA — Atelier Digital',
    template: '%s · AQEEL FANTASIA',
  },
  description: 'Aqeel Fantasia — Iraqi luxury menswear atelier. Bespoke tailoring, atelier notes, and pieces made for one.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
