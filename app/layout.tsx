import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AQEEL FANTASIA — Digital Universe',
  description: 'Dark luxury streetwear fantasy. Enter the world.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
