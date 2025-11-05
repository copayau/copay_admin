import { devtools } from 'zustand/middleware';
import { supabase } from '@/services/supabase/client';
import { create } from 'zustand';
import type { Blog } from '@/types/blog.types';

interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;

  // Actions
  fetchBlogs: () => Promise<void>;
  fetchBlogBySlug: (slug: string) => Promise<void>;
  createBlog: (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) => Promise<Blog>;
  updateBlog: (id: string, blog: Partial<Blog>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  uploadImage: (file: File, folder?: string) => Promise<string>;
  deleteImage: (url: string) => Promise<void>;
  setCurrentBlog: (blog: Blog | null) => void;
  clearError: () => void;
}

export const useBlogStore = create<BlogState>()(
  devtools(
    (set, get) => ({
      blogs: [],
      currentBlog: null,
      loading: false,
      error: null,
      uploadProgress: 0,

      fetchBlogs: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ blogs: data || [], loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch blogs',
            loading: false,
          });
        }
      },

      fetchBlogBySlug: async (slug: string) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('slug', slug)
            .single();

          if (error) throw error;
          set({ currentBlog: data, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch blog',
            loading: false,
          });
        }
      },

      createBlog: async (blog) => {
        set({ loading: true, error: null });
        try {
          // Generate slug if not provided
          const slug = blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

          const { data, error } = await supabase
            .from('blogs')
            .insert({
              ...blog,
              slug,
              date:
                blog.date ||
                new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
            })
            .select()
            .single();

          if (error) throw error;

          set({
            blogs: [data, ...get().blogs],
            loading: false,
          });

          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create blog';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      updateBlog: async (id: string, blog) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('blogs')
            .update({
              ...blog,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set({
            blogs: get().blogs.map((b) => (b.id === id ? data : b)),
            currentBlog: get().currentBlog?.id === id ? data : get().currentBlog,
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update blog';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      deleteBlog: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // Get blog to delete its image
          const blog = get().blogs.find((b) => b.id === id);

          // Delete image if exists
          if (blog?.image) {
            try {
              await get().deleteImage(blog.image);
            } catch (err) {
              console.warn('Failed to delete image:', err);
            }
          }

          const { error } = await supabase.from('blogs').delete().eq('id', id);

          if (error) throw error;

          set({
            blogs: get().blogs.filter((b) => b.id !== id),
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete blog';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      uploadImage: async (file: File, folder: string = 'property-images') => {
        set({ uploadProgress: 0, error: null });
        try {
          // Validate file
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            throw new Error('File size must be less than 5MB');
          }

          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
          if (!allowedTypes.includes(file.type)) {
            throw new Error('Only JPEG, PNG, and WebP images are allowed');
          }

          // Generate unique filename
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `${folder}/${fileName}`;

          // Upload file
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('property-images').getPublicUrl(filePath);

          set({ uploadProgress: 100 });
          return publicUrl;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
          set({ error: errorMessage, uploadProgress: 0 });
          throw new Error(errorMessage);
        }
      },

      deleteImage: async (url: string) => {
        try {
          // Extract path from URL
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/storage/v1/object/public/property-images/');
          if (pathParts.length < 2) return;

          const filePath = pathParts[1];

          const { error } = await supabase.storage.from('property-images').remove([filePath]);

          if (error) throw error;
        } catch (error) {
          console.error('Failed to delete image:', error);
          throw error;
        }
      },

      setCurrentBlog: (blog) => set({ currentBlog: blog }),

      clearError: () => set({ error: null }),
    }),
    { name: 'BlogStore' }
  )
);
