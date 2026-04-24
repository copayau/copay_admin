import { useEffect, useState } from 'react';
import { useVideoStore } from '@/store/videoStore';
import Table, { type TableColumn } from '@/components/ui/Table';
import VideoForm from '@/components/Video/Form';
import type { Video } from '@/lib/supabase/video.types';

export default function VideosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const { videos, loading, error, fetchVideos, deleteVideo } = useVideoStore();

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleCreate = () => {
    setEditingVideo(null);
    setIsFormOpen(true);
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteVideo(id);
      } catch (error) {
        console.error('Failed to delete video:', error);
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingVideo(null);
  };

  const columns: TableColumn<Video>[] = [
    {
      title: 'Video',
      key: 'title',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center space-x-3">
          {row.thumbnail_url ? (
            <img
              src={row.thumbnail_url}
              alt={row.title}
              className="w-16 h-10 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-10 bg-slate-200 rounded flex items-center justify-center text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <div>
            <div className="font-medium text-slate-900">{row.title}</div>
            <div className="text-sm text-slate-500">{row.slug}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'URL',
      key: 'url',
      render: (value) => (
        <a
          href={value as string}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm truncate max-w-xs block"
        >
          {value as string}
        </a>
      ),
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
      title: 'Category',
      key: 'category',
      sortable: true,
      render: (value) => (
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {value as string}
        </span>
      ),
    },
    {
      title: 'Created At',
      key: 'created_at',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-600">
          {new Date(value as string).toLocaleDateString()}
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
              handleEdit(row);
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
              handleDelete(row.id);
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
          <h2 className="text-2xl font-bold text-slate-800">YouTube & Podcasts</h2>
          <p className="text-slate-600 mt-1">Manage videos and podcast episodes</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Video</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Table
        data={videos}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search videos..."
        pagination={{
          enabled: true,
          pageSize: 10,
        }}
        hoverable
        onRowClick={handleEdit}
      />

      {isFormOpen && <VideoForm video={editingVideo} onClose={handleFormClose} />}
    </div>
  );
}
