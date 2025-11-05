import { devtools } from 'zustand/middleware';
import { supabase } from '@/services/supabase/client';
import { create } from 'zustand';
import type { Blog } from '@/types/blog.types';

interface interestStore {
  interest: Blog[];
  loading: boolean;
  error: string | null;
  uploadProgress: number;

  // Actions
  fetchInterest: () => Promise<void>;
}

export const useInterestStore = create<interestStore>()(
  devtools(
    (set, _) => ({
      interest: [],
      loading: false,
      error: null,
      uploadProgress: 0,

      fetchInterest: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('interest_registration')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ interest: data || [], loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch blogs',
            loading: false,
          });
        }
      },
    }),
    { name: 'InterestStore' }
  )
);
