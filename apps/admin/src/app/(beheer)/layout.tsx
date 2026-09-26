import { getStaffContext, hasRole } from '@/lib/club';
import { Sidebar } from '@/components/sidebar';

export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getStaffContext();
  const nav = [
    { href: '/', label: 'Dashboard', icon: 'dashboard' },
    { href: '/leden', label: 'Leden', icon: 'leden' },
    { href: '/starttijden', label: 'Starttijden', icon: 'starttijden' },
    ...(hasRole(ctx, 'secretariat', 'finance') ? [{ href: '/app-omzet', label: 'App-omzet', icon: 'omzet' }] : []),
    { href: '/wedstrijden', label: 'Wedstrijden', icon: 'wedstrijden' },
    { href: '/nieuws', label: 'Nieuws', icon: 'nieuws' },
    ...(hasRole(ctx, 'finance')
      ? [
          { href: '/financien', label: 'Financiën', icon: 'financien' },
          { href: '/financien/facturen', label: 'Facturen', icon: '', sub: true },
          { href: '/financien/incasso', label: 'Incasso', icon: '', sub: true },
          { href: '/financien/grootboek', label: 'Grootboek', icon: '', sub: true },
        ]
      : []),
    ...(hasRole(ctx) ? [{ href: '/instellingen', label: 'Instellingen', icon: 'instellingen' }] : []),
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar
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
