import { getStaffContext, hasRole } from '@/lib/club';
import { Sidebar } from '@/components/sidebar';

export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getStaffContext();
  const nav = [
    { href: '/', label: 'Dashboard', icon: '▦' },
    { href: '/leden', label: 'Leden', icon: '👥' },
    { href: '/starttijden', label: 'Starttijden', icon: '⏱' },
    { href: '/wedstrijden', label: 'Wedstrijden', icon: '🏆' },
    { href: '/nieuws', label: 'Nieuws', icon: '📰' },
    ...(hasRole(ctx, 'finance')
      ? [
          { href: '/financien', label: 'Financiën', icon: '€' },
          { href: '/financien/facturen', label: 'Facturen', icon: '🧾', sub: true },
          { href: '/financien/incasso', label: 'Incasso', icon: '🏦', sub: true },
          { href: '/financien/grootboek', label: 'Grootboek', icon: '📒', sub: true },
        ]
      : []),
    ...(hasRole(ctx) ? [{ href: '/instellingen', label: 'Instellingen', icon: '⚙' }] : []),
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
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
