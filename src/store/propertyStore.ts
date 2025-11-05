import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/services/supabase/client';
import type { Property } from '@/types/property.types';

interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProperties: () => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
  createProperty: (
    property: Omit<Property, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<Property>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  setCurrentProperty: (property: Property | null) => void;
  clearError: () => void;
}

export const usePropertyStore = create<PropertyState>()(
  devtools(
    (set, get) => ({
      properties: [],
      currentProperty: null,
      loading: false,
      error: null,

      fetchProperties: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ properties: data || [], loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch properties',
            loading: false,
          });
        }
      },

      fetchPropertyById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          set({ currentProperty: data, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch property',
            loading: false,
          });
        }
      },

      createProperty: async (property) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('properties')
            .insert({
              ...property,
              features: property.features || [],
            })
            .select()
            .single();

          if (error) throw error;

          set({
            properties: [data, ...get().properties],
            loading: false,
          });

          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create property';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      updateProperty: async (id: string, property) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('properties')
            .update({
              ...property,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set({
            properties: get().properties.map((p) => (p.id === id ? data : p)),
            currentProperty: get().currentProperty?.id === id ? data : get().currentProperty,
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update property';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      deleteProperty: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('properties').delete().eq('id', id);

          if (error) throw error;

          set({
            properties: get().properties.filter((p) => p.id !== id),
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete property';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      setCurrentProperty: (property) => set({ currentProperty: property }),

      clearError: () => set({ error: null }),
    }),
    { name: 'PropertyStore' }
  )
);
