import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogStore } from '../store/blogStore';
import Table, { type TableColumn } from '../components/ui/Table';
import type { Blog } from '../types/blog.types';

export default function BlogAllPage() {
  const navigate = useNavigate();
  const { blogs, loading, fetchBlogs, deleteBlog } = useBlogStore();

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(id);
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  };

  const columns: TableColumn<Blog>[] = [
    {
      title: 'Post',
      key: 'title',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center space-x-3">
          {row.image ? (
            <img src={row.image} alt={row.title} className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <div className="max-w-md">
            <div className="font-medium text-slate-900 truncate">{row.title}</div>
            <div className="text-sm text-slate-500 truncate">{row.excerpt}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      key: 'category',
      sortable: true,
      render: (value) => (
        <span className="inline-flex px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
          {value}
        </span>
      ),
    },
    {
      title: 'Date',
      key: 'date',
      sortable: true,
      render: (value) => <span className="text-sm text-slate-600">{value}</span>,
    },
    {
      title: 'Read Time',
      key: 'readTime',
      render: (value) => <span className="text-sm text-slate-600">{value || 'N/A'}</span>,
    },
    {
      title: 'Status',
      key: 'published',
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
          }`}
        >
          {value ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'id',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/blog/update/${row.slug}`);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              row.id && handleDelete(row.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">All Blog Posts</h2>
          <p className="text-slate-600 mt-1">Manage your blog content</p>
        </div>
        <button
          onClick={() => navigate('/blog/create')}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Post</span>
        </button>
      </div>

      <Table
        data={blogs}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search blog posts..."
        pagination={{
          enabled: true,
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50],
        }}
        hoverable
        onRowClick={(row) => {
          navigate(`/blog/update/${row.slug}`);
        }}
      />
    </div>
  );
}
