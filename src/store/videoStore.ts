import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/services/supabase/client';
import type { Video, VideoFormData } from '@/lib/supabase/video.types';

interface VideoState {
  videos: Video[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchVideos: () => Promise<void>;
  createVideo: (video: VideoFormData) => Promise<Video>;
  updateVideo: (id: string, video: Partial<VideoFormData>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  uploadThumbnail: (file: File) => Promise<string>;
  deleteThumbnail: (url: string) => Promise<void>;
  clearError: () => void;
}

export const useVideoStore = create<VideoState>()(
  devtools(
    (set, get) => ({
      videos: [],
      loading: false,
      error: null,

      fetchVideos: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ videos: data || [], loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch videos',
            loading: false,
          });
        }
      },

      createVideo: async (video) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('videos')
            .insert({
              ...video,
              published_at: video.published ? new Date().toISOString() : null,
            })
            .select()
            .single();

          if (error) throw error;
          set({ videos: [data, ...get().videos], loading: false });
          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create video';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      updateVideo: async (id, video) => {
        set({ loading: true, error: null });
        try {
          const updateData: any = { ...video };
          if (video.published !== undefined) {
            updateData.published_at = video.published ? new Date().toISOString() : null;
          }

          const { data, error } = await supabase
            .from('videos')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;
          set({
            videos: get().videos.map((v) => (v.id === id ? data : v)),
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update video';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      deleteVideo: async (id) => {
        set({ loading: true, error: null });
        try {
          // Get video to delete its thumbnail
          const video = get().videos.find((v) => v.id === id);
          if (video?.thumbnail_url) {
            try {
              await get().deleteThumbnail(video.thumbnail_url);
            } catch (err) {
              console.warn('Failed to delete thumbnail:', err);
            }
          }
          const { error } = await supabase.from('videos').delete().eq('id', id);
          if (error) throw error;
          set({
            videos: get().videos.filter((v) => v.id !== id),
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete video';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      uploadThumbnail: async (file: File) => {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `video-thumbnails/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from('property-images').getPublicUrl(filePath);

          return publicUrl;
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Failed to upload thumbnail');
        }
      },

      deleteThumbnail: async (url: string) => {
        try {
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/storage/v1/object/public/property-images/');
          if (pathParts.length < 2) return;
          const filePath = pathParts[1];
          await supabase.storage.from('property-images').remove([filePath]);
        } catch (error) {
          console.error('Failed to delete thumbnail:', error);
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'VideoStore' }
  )
);
