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
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (!error && data) {
      set({ profile: data, loading: false });
      useGamifyStore.getState().setGamifyData({
        points: data.points ?? 0,
        streak: data.streak ?? 0,
        history: data.workout_history ?? {},
        customRewards: data.custom_rewards ?? [],
        redeemedHistory: data.redeemed_history ?? []
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
