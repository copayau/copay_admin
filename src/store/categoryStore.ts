import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/services/supabase/client';
import type { Category, DynamicField } from '../types/category.types';

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: string) => Promise<void>;
  fetchCategoryBySlug: (slug: string) => Promise<void>;
  createCategory: (
    category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setCurrentCategory: (category: Category | null) => void;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set, get) => ({
      categories: [],
      currentCategory: null,
      loading: false,
      error: null,

      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

          if (error) throw error;
          set({ categories: data || [], loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch categories',
            loading: false,
          });
        }
      },

      fetchCategoryById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          set({ currentCategory: data, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch category',
            loading: false,
          });
        }
      },

      fetchCategoryBySlug: async (slug: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .single();

          if (error) throw error;
          set({ currentCategory: data, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch category',
            loading: false,
          });
        }
      },

      createCategory: async (category) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('categories')
            .insert(category)
            .select()
            .single();

          if (error) throw error;

          set({
            categories: [...get().categories, data],
            loading: false,
          });

          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      updateCategory: async (id: string, category) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('categories')
            .update(category)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set({
            categories: get().categories.map((c) => (c.id === id ? data : c)),
            currentCategory: get().currentCategory?.id === id ? data : get().currentCategory,
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      deleteCategory: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('categories').delete().eq('id', id);

          if (error) throw error;

          set({
            categories: get().categories.filter((c) => c.id !== id),
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      setCurrentCategory: (category) => set({ currentCategory: category }),
      clearError: () => set({ error: null }),
    }),
    { name: 'CategoryStore' }
  )
);
