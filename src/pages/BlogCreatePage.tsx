import { useNavigate } from 'react-router-dom';
import BlogForm from '../components/BlogForm';

export default function BlogCreatePage() {
  const navigate = useNavigate();

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
          <h2 className="text-2xl font-bold text-slate-800">Create New Blog Post</h2>
          <p className="text-slate-600 mt-1">Write and publish a new article</p>
        </div>
      </div>

      <BlogForm blog={null} />
    </div>
  );
}
