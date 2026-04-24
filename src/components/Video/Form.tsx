import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useVideoStore } from '@/store/videoStore';
import type { Video, VideoFormData } from '@/lib/supabase/video.types';
import ImageUpload from '../ImageUpload';

interface VideoFormProps {
  video: Video | null;
  onClose: () => void;
}

export default function VideoForm({ video, onClose }: VideoFormProps) {
  const { createVideo, updateVideo, uploadThumbnail, loading } = useVideoStore();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<VideoFormData>({
    defaultValues: video || {
      title: '',
      slug: '',
      url: '',
      thumbnail_url: '',
      description: '',
      category: 'podcast',
      published: false,
    },
  });

  const title = watch('title');

  useEffect(() => {
    if (video) {
      reset(video);
    }
  }, [video, reset]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!video && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [title, video, setValue]);

  const onSubmit = async (data: VideoFormData) => {
    try {
      if (video?.id) {
        await updateVideo(video.id, data);
      } else {
        await createVideo(data);
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to save video');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {video ? 'Edit Video' : 'Add New Video'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">Video details and display settings</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Video title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slug (URL-friendly) *
                </label>
                <input
                  {...register('slug', { required: 'Slug is required' })}
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="video-slug"
                />
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Video/Podcast URL *
                </label>
                <input
                  {...register('url', { required: 'URL is required' })}
                  type="url"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="podcast">Podcast</option>
                  <option value="video">Video</option>
                  <option value="tutorial">Tutorial</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Thumbnail</label>
                <Controller
                  control={control}
                  name="thumbnail_url"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      onUpload={uploadThumbnail}
                      label="Upload Thumbnail"
                    />
                  )}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Short description of the video..."
                />
              </div>

              {/* Published Status */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    {...register('published')}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">Published</span>
                </label>
                <p className="text-xs text-slate-500 mt-1 ml-6">
                  Published videos will be visible on the public website.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">* Required fields</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg"
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
                <span>{video ? 'Update' : 'Add'} Video</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
