import type { CSSProperties } from 'react';
import { brandCssVars, getBrand } from '@golfapp/shared';
import { getStaffContext, hasRole } from '@/lib/club';
import { Sidebar } from '@/components/sidebar';

export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getStaffContext();
  const nav = [
    { href: '/', label: 'Mission control', icon: 'dashboard' },
    { href: '/leden', label: 'Leden', icon: 'leden' },
    { href: '/starttijden', label: 'Starttijden', icon: 'starttijden' },
    ...(hasRole(ctx, 'secretariat', 'finance') ? [{ href: '/app-omzet', label: 'Bedrijfsstatistieken', icon: 'omzet' }] : []),
    ...(hasRole(ctx, 'finance')
      ? [
          { href: '/app-omzet/aanbod', label: 'Aanbod', icon: '', sub: true },
          { href: '/app-omzet/sponsors', label: 'Sponsors', icon: '', sub: true },
        ]
      : []),
    { href: '/wedstrijden', label: 'Wedstrijden', icon: 'wedstrijden' },
    { href: '/nieuws', label: 'Nieuws', icon: 'nieuws' },
    ...(hasRole(ctx, 'finance')
      ? [
          { href: '/financien', label: 'Financiën', icon: 'financien' },
          { href: '/financien/facturen', label: 'Facturen', icon: '', sub: true },
          { href: '/financien/horeca', label: 'Horeca op rekening', icon: '', sub: true },
        ]
      : []),
    // Wie de bar doet maar niet bij financiën kan, zet hier bestellingen op rekening
    ...(hasRole(ctx, 'secretariat') && !hasRole(ctx, 'finance') ? [{ href: '/financien/horeca', label: 'Horeca op rekening', icon: 'financien' }] : []),
    ...(hasRole(ctx) ? [{ href: '/instellingen', label: 'Instellingen', icon: 'instellingen' }] : []),
  ];

  // Club met een eigen merk: dezelfde schermen in de kleuren van de club
  const brand = getBrand(ctx.club.brand);

  return (
    <div className="flex min-h-screen bg-chalk" style={brandCssVars(brand) as CSSProperties}>
      <Sidebar
        brand={{ key: brand.key, name: brand.name, monogram: brand.monogram, hasLogo: brand.hasLogo }}
        nav={nav}
        clubs={ctx.clubs}
        currentClubId={ctx.club.id}
        clubName={ctx.club.name}
        email={ctx.email ?? ''}
      />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-10">{children}</main>
    </div>
  );
}
