import { Sidebar } from '@/components/sidebar';
import { requirePlatformStaff } from '@/lib/hq';

export default async function HqLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requirePlatformStaff();
  const nav = [
    { href: '/hq', label: 'Mission control', icon: 'dashboard' },
    { href: '/hq#klanten', label: 'Klanten', icon: 'klanten' },
    { href: '/hq/verkoop', label: 'Verkoop', icon: 'verkoop' },
    { href: '/hq/klanten/nieuw', label: 'Club aanmaken', icon: 'nieuw' },
    ...(ctx.isClubStaff ? [{ href: '/', label: 'Naar clubbeheer', icon: 'leden' }] : []),
  ];
  return (
    <div className="flex min-h-screen">
      <Sidebar nav={nav} clubs={[]} currentClubId="" clubName="Greenside" eyebrow="Greenside HQ" email={ctx.email ?? ''} />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-10">{children}</main>
    </div>
  );
}
