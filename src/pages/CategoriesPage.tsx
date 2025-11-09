// src/pages/CategoriesPage.tsx
import { useEffect, useState } from 'react';
import { useCategoryStore } from '@/store/categoryStore';
import Table, { type TableColumn } from '@/components/ui/Table';
import CategoryForm from '@/components/Category/Form';
import type { Category } from '@/types/category.types';

export default function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { categories, loading, error, fetchCategories, deleteCategory } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure? This will affect all assets in this category.')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const columns: TableColumn<Category>[] = [
    {
      title: 'Category',
      key: 'title',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-xl">
            {row.icon || '📁'}
          </div>
          <div>
            <div className="font-medium text-slate-900">{row.title}</div>
            <div className="text-sm text-slate-500">{row.slug}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      render: (value) => (
        <div className="max-w-md truncate text-sm text-slate-600">{value || 'No description'}</div>
      ),
    },
    {
      title: 'Dynamic Fields',
      key: 'dynamic_fields',
      render: (value) => {
        const fields = value as any[];
        return (
          <span className="text-sm text-slate-600">
            {fields?.length || 0} custom {fields?.length === 1 ? 'field' : 'fields'}
          </span>
        );
      },
    },
    {
      title: 'Status',
      key: 'is_active',
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Order',
      key: 'display_order',
      sortable: true,
      align: 'center',
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
          <h2 className="text-2xl font-bold text-slate-800">Asset Categories</h2>
          <p className="text-slate-600 mt-1">Manage category types and their custom fields</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Category</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Category Table */}
      <Table
        data={categories}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search categories..."
        pagination={{
          enabled: true,
          pageSize: 10,
        }}
        hoverable
        onRowClick={handleEdit}
      />

      {/* Category Form Modal */}
      {isFormOpen && <CategoryForm category={editingCategory} onClose={handleFormClose} />}
    </div>
  );
}
