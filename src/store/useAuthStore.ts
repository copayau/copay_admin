import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/services/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,

      setUser: (user) => set({ user }),

      setLoading: (loading) => set({ loading }),

      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        set({ user: data.user });
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({ user: null });
      },

      initialize: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          set({ user: session?.user ?? null, loading: false });

          // Listen to auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null });
          });
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
);
