'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CalendarClock, Landmark, LayoutDashboard, Newspaper, Settings, TrendingUp, Trophy, Users, type LucideIcon } from 'lucide-react';
import { selectClub, logout } from '@/app/(beheer)/actions';
import { Contours, Wordmark } from './brand';

interface NavItem { href: string; label: string; icon: string; sub?: boolean }

const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard, leden: Users, starttijden: CalendarClock, wedstrijden: Trophy,
  nieuws: Newspaper, financien: Landmark, instellingen: Settings, omzet: TrendingUp,
};

export function Sidebar({ nav, clubs, currentClubId, clubName, email }: {
  nav: NavItem[];
  clubs: { id: string; name: string }[];
  currentClubId: string;
  clubName: string;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || (pathname.startsWith(href + '/') && !nav.some((n) => n.href !== href && n.href.startsWith(href) && pathname.startsWith(n.href)));

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-4 top-4 z-30 rounded-full bg-pine-900 px-4 py-2 text-sm font-bold text-chalk md:hidden"
      >
        Menu
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-68 flex-col overflow-hidden bg-pine-900 text-chalk transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Contours seed={4} opacity={0.07} className="text-chalk" />
        <div className="relative px-6 pb-5 pt-7">
          <Wordmark />
          <div className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brass-light">Clubbeheer</div>
          {clubs.length > 1 ? (
            <form action={selectClub}>
              <select
                name="club_id"
                defaultValue={currentClubId}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                className="mt-1.5 w-full border-white/15 bg-white/5 font-display text-base text-chalk"
              >
                {clubs.map((c) => <option key={c.id} value={c.id} className="text-stone-900">{c.name}</option>)}
              </select>
            </form>
          ) : (
            <div className="mt-1 font-display text-lg italic">{clubName}</div>
          )}
        </div>
        <nav className="relative flex-1 space-y-0.5 overflow-y-auto px-3">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${item.sub ? 'py-2 pl-11 text-[13px]' : ''} ${
                  active ? 'bg-chalk text-pine-900' : 'text-chalk/70 hover:bg-white/5 hover:text-chalk'
                }`}
              >
                {!item.sub && (() => { const Icon = icons[item.icon]; return Icon ? <Icon size={18} strokeWidth={1.75} /> : null; })()}
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brass" />}
              </Link>
            );
          })}
        </nav>
        <div className="relative border-t border-white/10 px-6 py-5 text-xs">
          <div className="truncate text-chalk/60">{email}</div>
          <form action={logout}>
            <button className="mt-1 font-bold text-brass-light hover:underline">Uitloggen</button>
          </form>
        </div>
      </aside>
    </>
  );
}
