import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600'], style: ['normal', 'italic'], variable: '--font-fraunces' });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: { default: 'Greenside Clubbeheer', template: '%s · Greenside' },
  description: 'Leden-, baan- en financieel beheer voor golfclubs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
