// src/components/BlogForm.tsx
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { type Resolver } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { blogSchema, type Blog, type BlogFormData } from '../types/blog.types';
import { useBlogStore } from '../store/blogStore';
import ImageUpload from './ImageUpload';
import RichTextEditor from './RichTextEditor';
import { useSnackbar } from './Snackbar';

interface BlogFormProps {
  blog: Blog | null;
}

const categories = [
  { id: 'adventure', name: 'Adventure', slug: 'adventure' },
  { id: 'real-estate', name: 'Real Estate', slug: 'real-estate' },
  { id: 'investment', name: 'Investment', slug: 'investment' },
  { id: 'lifestyle', name: 'Lifestyle', slug: 'lifestyle' },
  { id: 'technology', name: 'Technology', slug: 'technology' },
];

export default function BlogForm({ blog }: BlogFormProps) {
  const navigate = useNavigate();
  const { createBlog, updateBlog, uploadImage, loading } = useBlogStore();
  const [selectedCategory, setSelectedCategory] = useState(blog?.categoryId || '');
  const { showSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BlogFormData>({
    resolver: zodResolver(
      blogSchema.omit({ id: true, created_at: true, updated_at: true })
    ) as Resolver<BlogFormData>,
    defaultValues: blog || {
      slug: '',
      category: '',
      categoryId: '',
      title: '',
      excerpt: '',
      image: '',
      date: '',
      readTime: '',
      content: '',
      relatedPosts: [],
      published: false,
    },
  });

  const title = watch('title');

  useEffect(() => {
    if (blog) {
      reset(blog);
      setSelectedCategory(blog.categoryId);
    }
  }, [blog, reset]);

  useEffect(() => {
    if (!blog && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [title, blog, setValue]);

  const onSubmit = async (data: BlogFormData) => {
    try {
      if (blog?.id) {
        await updateBlog(blog.id, data);
        showSnackbar('Blog post updated successfully!', 'success');
      } else {
        await createBlog(data);
        showSnackbar('Blog post created successfully!', 'success');
        navigate('/blog/all');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showSnackbar('Failed to save blog post', 'error');
    }
  };

  const onError = (errors: any) => {
    console.log('Validation errors:', errors);
    showSnackbar('Please fill in all required fields', 'error');
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategory(categoryId);
      setValue('categoryId', categoryId);
      setValue('category', category.name);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 mb-2">
              Please fix the following errors:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([field, error]: [string, any]) => (
                <li key={field}>
                  • {field}: {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your blog post title..."
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Slug * <span className="text-slate-500 font-normal">(URL-friendly)</span>
              </label>
              <input
                {...register('slug')}
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your-blog-post-slug"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Read Time</label>
              <input
                {...register('readTime')}
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5 min read"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                {...register('date')}
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="March 16, 2025"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Excerpt * <span className="text-slate-500 font-normal">(Short description)</span>
              </label>
              <textarea
                {...register('excerpt')}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief summary of your blog post..."
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Featured Image</h3>

          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                onUpload={(file) => uploadImage(file, 'property-images')}
                label="Upload Featured Image"
                aspectRatio="16/9"
              />
            )}
          />
          {errors.image && <p className="text-sm text-red-600">{errors.image.message}</p>}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Content</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Blog Content *</label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor content={field.value || ''} onChange={field.onChange} />
              )}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Use the toolbar above to format your content. Add headings, lists, links, and more
              with just a click.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Publishing</h3>

          <div className="flex items-center">
            <Controller
              name="published"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
              )}
            />
            <label className="ml-2 text-sm font-medium text-slate-700">Publish this post</label>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/blog/all')}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {blog && (
              <button
                type="button"
                onClick={async () => {
                  setValue('published', false);
                  await handleSubmit(onSubmit, onError)();
                }}
                disabled={loading}
                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              <span>{blog ? 'Update Post' : 'Create Post'}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
