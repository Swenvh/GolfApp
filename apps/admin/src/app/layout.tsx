import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'GolfApp Clubbeheer', template: '%s · GolfApp Clubbeheer' },
  description: 'Leden-, baan- en financieel beheer voor golfclubs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
