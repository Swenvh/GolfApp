'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { selectClub, logout } from '@/app/(beheer)/actions';

interface NavItem { href: string; label: string; icon: string; sub?: boolean }

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
        className="fixed right-4 top-4 z-30 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm md:hidden"
      >
        Menu
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="border-b border-stone-100 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">⛳ Clubbeheer</div>
          {clubs.length > 1 ? (
            <form action={selectClub}>
              <select
                name="club_id"
                defaultValue={currentClubId}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                className="mt-2 w-full font-semibold"
              >
                {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </form>
          ) : (
            <div className="mt-1 font-semibold">{clubName}</div>
          )}
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${item.sub ? 'pl-9' : ''} ${
                isActive(item.href) ? 'bg-brand-50 font-semibold text-brand-700' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {!item.sub && <span className="w-4 text-center">{item.icon}</span>}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-stone-100 p-4 text-xs text-stone-500">
          <div className="truncate">{email}</div>
          <form action={logout}>
            <button className="mt-1 text-brand-600 hover:underline">Uitloggen</button>
          </form>
        </div>
      </aside>
    </>
  );
}
