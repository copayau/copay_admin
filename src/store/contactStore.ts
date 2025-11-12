import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/services/supabase/client';
export interface ContactType {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  phone_number?: number | null;
  interest?: string | null;
}
interface ContactState {
  contacts: ContactType[];
  loading: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useContactStore = create<ContactState>()(
  devtools(
    (set, get) => ({
      contacts: [],
      loading: false,
      error: null,

      fetchContacts: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ contacts: data || [], loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch categories',
            loading: false,
          });
        }
      },
      deleteContact: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('contact_submissions').delete().eq('id', id);

          if (error) throw error;

          set({
            contacts: get().contacts.filter((c) => c.id !== id),
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
    { name: 'ContactStore' }
  )
);
