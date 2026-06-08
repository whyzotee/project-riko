import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../types/profile'
import { useGamifyStore } from './useGamifyStore'

export type Theme = 'light' | 'dark' | 'system'

interface AppState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  theme: Theme
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setTheme: (theme: Theme) => void
  applyTheme: (theme: Theme) => void
  fetchProfile: (userId: string) => Promise<void>
  initialize: () => () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  theme: (localStorage.getItem('theme') as Theme) || 'system',

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    get().applyTheme(theme);
  },

  applyTheme: (theme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  },

  fetchProfile: async (userId: string) => {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    const { data: records, error: recordsErr } = await supabase
      .from("workout_records")
      .select("*")
      .eq("user_id", userId);
    
    if (!profileErr && profile) {
      set({ profile, loading: false });
      
      const historyRecord: Record<string, { gym: boolean; walk: boolean; steps10k?: boolean }> = {};
      interface WorkoutRow {
        date: string;
        gym: boolean;
        walk: boolean;
        steps10k: boolean;
      }
      
      if (!recordsErr && records) {
        (records as unknown as WorkoutRow[]).forEach((row) => {
          historyRecord[row.date] = {
            gym: row.gym || false,
            walk: row.walk || false,
            steps10k: row.steps10k || false,
          };
        });
      }

      const gamifyStore = useGamifyStore.getState();
      gamifyStore.setGamifyData({
        points: profile.points !== undefined && profile.points !== null ? profile.points : gamifyStore.points,
        streak: profile.streak !== undefined && profile.streak !== null ? profile.streak : gamifyStore.streak,
        history: records !== null && records !== undefined ? historyRecord : gamifyStore.history,
        customRewards: profile.custom_rewards !== undefined && profile.custom_rewards !== null ? profile.custom_rewards : gamifyStore.customRewards,
        redeemedHistory: profile.redeemed_history !== undefined && profile.redeemed_history !== null ? profile.redeemed_history : gamifyStore.redeemedHistory
      });
    } else {
      set({ loading: false });
    }
  },

  initialize: () => {
    // Apply initial theme
    get().applyTheme(get().theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (get().theme === 'system') {
        get().applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session });
      if (session) {
        get().fetchProfile(session.user.id);
      } else {
        set({ loading: false });
      }
    });

    // Auth listener
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) {
        get().fetchProfile(session.user.id);
      } else {
        set({ profile: null, loading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }
}))
