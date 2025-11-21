import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/services/supabase/client';
interface InterestType {
  id: string;
  full_name: string;
  email: string;
  budget_range?: string | null;
  expected_usages?: string | null;
  city?: string | null;
  created_at: string;
  phone?: number | null;
  interest?: string | null;
}
interface InterestState {
  interests: InterestType[];
  loading: boolean;
  error: string | null;
  fetchInterest: () => Promise<void>;
  deleteInterest: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useInterestStore = create<InterestState>()(
  devtools(
    (set, get) => ({
      contacts: [],
      loading: false,
      error: null,

      fetchInterest: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: true });

          if (error) throw error;
          set({ interests: data || [], loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch categories',
            loading: false,
          });
        }
      },
      deleteInterest: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('subscriptions').delete().eq('id', id);

          if (error) throw error;

          set({
            interests: get().interests.filter((c) => c.id !== id),
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'InterestStore' }
  )
);
