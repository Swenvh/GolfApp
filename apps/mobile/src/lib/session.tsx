import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Club, Member } from '@golfapp/shared';
import { supabase } from './supabase';

const SELECTED_KEY = 'golfapp.selectedMember';
/** Bij een white-label build is de app vast gekoppeld aan één club */
const slugSetting: unknown = Constants.expoConfig?.extra?.clubSlug;
const LOCKED_CLUB_SLUG = typeof slugSetting === 'string' && slugSetting.length > 0 ? slugSetting : null;

export type Membership = Member & { club: Club };

interface SessionState {
  loading: boolean;
  session: Session | null;
  memberships: Membership[];
  /** Het actieve lidmaatschap (lid + club) */
  member: Membership | null;
  selectMember: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMemberships = useCallback(async (s: Session | null) => {
    if (!s) {
      setMemberships([]);
      return;
    }
    const { data } = await supabase
      .from('members')
      .select('*, club:clubs(*)')
      .eq('user_id', s.user.id)
      .in('status', ['active', 'suspended']);
    let rows = (data ?? []) as Membership[];
    if (LOCKED_CLUB_SLUG) rows = rows.filter((m) => m.club.slug === LOCKED_CLUB_SLUG);
    setMemberships(rows);
    const stored = await AsyncStorage.getItem(SELECTED_KEY);
    setSelectedId(rows.some((m) => m.id === stored) ? stored : rows.length === 1 ? rows[0]!.id : null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadMemberships(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setLoading(true);
        // Niet binnen de callback zelf Supabase aanroepen: dat kan een deadlock op de auth-lock geven
        setTimeout(() => { loadMemberships(s).finally(() => setLoading(false)); }, 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadMemberships]);

  const value = useMemo<SessionState>(() => ({
    loading,
    session,
    memberships,
    member: memberships.find((m) => m.id === selectedId) ?? null,
    selectMember: async (id) => {
      await AsyncStorage.setItem(SELECTED_KEY, id);
      setSelectedId(id);
    },
    refresh: () => loadMemberships(session),
    signOut: async () => {
      await AsyncStorage.removeItem(SELECTED_KEY);
      await supabase.auth.signOut();
    },
  }), [loading, session, memberships, selectedId, loadMemberships]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession buiten SessionProvider');
  return ctx;
}

/** Voor schermen binnen de ingelogde omgeving: lid is gegarandeerd aanwezig. */
export function useMember(): Membership {
  const { member } = useSession();
  if (!member) throw new Error('Geen actief lidmaatschap');
  return member;
}
