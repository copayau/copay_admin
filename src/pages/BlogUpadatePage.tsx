import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlogStore } from '../store/blogStore';
import BlogForm from '../components/BlogForm';

export default function BlogUpdatePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currentBlog, loading, fetchBlogBySlug } = useBlogStore();

  useEffect(() => {
    if (slug) {
      fetchBlogBySlug(slug);
    }
  }, [slug, fetchBlogBySlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
          >
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
          <p className="text-slate-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Blog post not found</p>
        <button
          onClick={() => navigate('/blog/all')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to all posts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/blog/all')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Update Blog Post</h2>
          <p className="text-slate-600 mt-1">Edit your article content</p>
        </div>
      </div>

      <BlogForm blog={currentBlog} />
    </div>
  );
}
