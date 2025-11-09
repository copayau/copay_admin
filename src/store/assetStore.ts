import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/services/supabase/client';
import type { Asset } from '../types/asset.types';

interface AssetState {
  assets: Asset[];
  currentAsset: Asset | null;
  loading: boolean;
  error: string | null;

  fetchAssets: (categoryId?: string) => Promise<void>;
  fetchAssetById: (id: string) => Promise<void>;
  fetchAssetBySlug: (slug: string) => Promise<void>;
  createAsset: (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => Promise<Asset>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  uploadImage: (file: File, folder?: string) => Promise<string>;
  setCurrentAsset: (asset: Asset | null) => void;
  clearError: () => void;
}

export const useAssetStore = create<AssetState>()(
  devtools(
    (set, get) => ({
      assets: [],
      currentAsset: null,
      loading: false,
      error: null,

      fetchAssets: async (categoryId?: string) => {
        set({ loading: true, error: null });
        try {
          let query = supabase
            .from('assets')
            .select('*, categories(*)')
            .order('created_at', { ascending: false });

          if (categoryId) {
            query = query.eq('category_id', categoryId);
          }

          const { data, error } = await query;

          if (error) throw error;
          set({ assets: data || [], loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch assets',
            loading: false,
          });
        }
      },

      fetchAssetById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('assets')
            .select('*, categories(*)')
            .eq('id', id)
            .single();

          if (error) throw error;
          set({ currentAsset: data, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch asset',
            loading: false,
          });
        }
      },

      fetchAssetBySlug: async (slug: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('assets')
            .select('*, categories(*)')
            .eq('slug', slug)
            .single();

          if (error) throw error;
          set({ currentAsset: data, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch asset',
            loading: false,
          });
        }
      },

      createAsset: async (asset) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.from('assets').insert(asset).select().single();

          if (error) throw error;

          set({
            assets: [data, ...get().assets],
            loading: false,
          });

          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create asset';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      updateAsset: async (id: string, asset) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('assets')
            .update(asset)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set({
            assets: get().assets.map((a) => (a.id === id ? data : a)),
            currentAsset: get().currentAsset?.id === id ? data : get().currentAsset,
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update asset';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      deleteAsset: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.from('assets').delete().eq('id', id);

          if (error) throw error;

          set({
            assets: get().assets.filter((a) => a.id !== id),
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete asset';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      uploadImage: async (file: File, folder: string = 'asset-images') => {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `${folder}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from('images').getPublicUrl(filePath);

          return publicUrl;
        } catch (error) {
          throw error;
        }
      },

      setCurrentAsset: (asset) => set({ currentAsset: asset }),
      clearError: () => set({ error: null }),
    }),
    { name: 'AssetStore' }
  )
);
