import { z } from 'zod';

export const blogCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const blogSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(500),
  image: z.string().url('Must be a valid URL').optional(),
  date: z.string().optional(),
  readTime: z.string().optional(),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  relatedPosts: z.array(z.number()).optional().default([]),
  published: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Blog = z.infer<typeof blogSchema>;
export type BlogCategory = z.infer<typeof blogCategorySchema>;
export type BlogFormData = Omit<Blog, 'id' | 'created_at' | 'updated_at'>;
