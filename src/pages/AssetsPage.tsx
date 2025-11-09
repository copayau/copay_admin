// src/pages/AssetsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetStore } from '@/store/assetStore';
import { useCategoryStore } from '@/store/categoryStore';
import Table, { type TableColumn } from '@/components/ui/Table';
import type { Asset } from '../types/asset.types';

export default function AssetsPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { assets, loading, error, fetchAssets, deleteAsset } = useAssetStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      fetchAssets();
    } else {
      fetchAssets(selectedCategory);
    }
  }, [selectedCategory, fetchAssets]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAsset(id);
      } catch (error) {
        console.error('Failed to delete asset:', error);
      }
    }
  };

  const columns: TableColumn<Asset>[] = [
    {
      title: 'Asset',
      key: 'title',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center space-x-3">
          {row.feature_image ? (
            <img
              src={row.feature_image}
              alt={row.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
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
            <div className="text-sm text-slate-500 truncate">{row.short_description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      key: 'category_id',
      sortable: true,
      render: (_, row: any) => {
        const category = categories.find((c) => c.id === row.category_id);
        return (
          <span className="inline-flex px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {category?.icon} {category?.title || 'Unknown'}
          </span>
        );
      },
    },
    {
      title: 'Price',
      key: 'price',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-slate-900">${Number(value).toLocaleString()}</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      sortable: true,
      render: (value) => {
        const colors = {
          available: 'bg-green-100 text-green-800',
          sold: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
          draft: 'bg-slate-100 text-slate-800',
        };
        return (
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      title: 'Published',
      key: 'published',
      sortable: true,
      align: 'center',
      render: (value) =>
        value ? (
          <svg className="w-5 h-5 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-slate-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z"
              clipRule="evenodd"
            />
          </svg>
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
              navigate(`/assets/edit/${row.id}`);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assets Management</h2>
          <p className="text-slate-600 mt-1">Manage all your assets across categories</p>
        </div>
        <button
          onClick={() => navigate('/assets/create')}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Asset</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Assets Table */}
      <Table
        data={assets}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search assets..."
        pagination={{
          enabled: true,
          pageSize: 15,
          showSizeChanger: true,
          pageSizeOptions: [15, 25, 50, 100],
        }}
        customFilters={
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.title}
              </option>
            ))}
          </select>
        }
        hoverable
        onRowClick={(row: any) => navigate(`/assets/edit/${row.id}`)}
      />
    </div>
  );
}
