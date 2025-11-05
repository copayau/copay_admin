// src/pages/PropertiesPage.tsx
import { useEffect, useState } from 'react';
import { usePropertyStore } from '@/store/propertyStore';
import PropertyForm from '../components/PropertyForm';
import PropertyList from '../components/PropertyList';
import type { Property } from '../types/property.types';

export default function PropertiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const { properties, loading, error, fetchProperties, deleteProperty } = usePropertyStore();

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleCreate = () => {
    setEditingProperty(null);
    setIsFormOpen(true);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
      } catch (error) {
        console.error('Failed to delete property:', error);
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProperty(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Properties Management</h2>
          <p className="text-slate-600 mt-1">Manage your real estate listings</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Property</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <svg
            className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Property List */}
      <PropertyList
        properties={properties}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Property Form Modal */}
      {isFormOpen && <PropertyForm property={editingProperty} onClose={handleFormClose} />}
    </div>
  );
}
