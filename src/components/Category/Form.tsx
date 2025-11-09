// src/components/CategoryForm.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  categorySchema,
  type Category,
  type DynamicField,
  type FieldType,
} from '@/types/category.types';
import { useCategoryStore } from '@/store/categoryStore';

interface CategoryFormProps {
  category: Category | null;
  onClose: () => void;
}

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'date', label: 'Date' },
];

export default function CategoryForm({ category, onClose }: CategoryFormProps) {
  const { createCategory, updateCategory, loading } = useCategoryStore();
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(
    category?.dynamic_fields || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(categorySchema.omit({ id: true, created_at: true, updated_at: true })),
    defaultValues: category || {
      title: '',
      slug: '',
      description: '',
      icon: '',
      dynamic_fields: [],
      is_active: true,
      display_order: 0,
    },
  });

  const title = watch('title');

  useEffect(() => {
    if (category) {
      reset(category);
      setDynamicFields(category.dynamic_fields || []);
    }
  }, [category, reset]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!category && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [title, category, setValue]);

  const addDynamicField = () => {
    const newField: DynamicField = {
      name: '',
      label: '',
      type: 'text',
      required: false,
    };
    setDynamicFields([...dynamicFields, newField]);
  };

  const updateDynamicField = (index: number, updates: Partial<DynamicField>) => {
    const updated = [...dynamicFields];
    updated[index] = { ...updated[index], ...updates };
    setDynamicFields(updated);
  };

  const removeDynamicField = (index: number) => {
    setDynamicFields(dynamicFields.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      const categoryData = {
        ...data,
        dynamic_fields: dynamicFields,
      };

      if (category?.id) {
        await updateCategory(category.id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to save category');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {category ? 'Edit Category' : 'Create New Category'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">Define category details and custom fields</p>
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
            {/* Basic Information */}
            <section className="space-y-4 pb-6 border-b border-slate-200">
              <h4 className="text-lg font-semibold text-slate-800">Basic Information</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category Title *
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Properties, Vehicles, Boats..."
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Slug (URL-friendly) *
                  </label>
                  <input
                    {...register('slug')}
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="properties"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug.message as string}</p>
                  )}
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Icon (Emoji or Text)
                  </label>
                  <input
                    {...register('icon')}
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="🏠"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Display Order
                  </label>
                  <input
                    {...register('display_order', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Category description..."
                  />
                </div>

                {/* Active Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('is_active')}
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">Active</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Dynamic Fields Builder */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-slate-800">Custom Fields</h4>
                  <p className="text-sm text-slate-600">
                    Define category-specific fields for assets
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addDynamicField}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Add Field</span>
                </button>
              </div>

              {dynamicFields.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <svg
                    className="w-12 h-12 text-slate-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-slate-600">No custom fields yet</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Click "Add Field" to create custom fields
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dynamicFields.map((field, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Field Name */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Field Name (code)
                          </label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateDynamicField(index, { name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder="bedrooms"
                          />
                        </div>

                        {/* Field Label */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Field Label (display)
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateDynamicField(index, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder="Bedrooms"
                          />
                        </div>

                        {/* Field Type */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Field Type
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) =>
                              updateDynamicField(index, { type: e.target.value as FieldType })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          >
                            {fieldTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Required */}
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) =>
                                updateDynamicField(index, { required: e.target.checked })
                              }
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded"
                            />
                            <span className="text-sm text-slate-700">Required</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => removeDynamicField(index)}
                            className="ml-auto text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Remove field"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Options for Select */}
                        {field.type === 'select' && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Options (comma separated)
                            </label>
                            <input
                              type="text"
                              value={field.options?.join(', ') || ''}
                              onChange={(e) =>
                                updateDynamicField(index, {
                                  options: e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                              placeholder="Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}

                        {/* Min/Max for Number */}
                        {field.type === 'number' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Min Value
                              </label>
                              <input
                                type="number"
                                value={field.min || ''}
                                onChange={(e) =>
                                  updateDynamicField(index, { min: Number(e.target.value) })
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Max Value
                              </label>
                              <input
                                type="number"
                                value={field.max || ''}
                                onChange={(e) =>
                                  updateDynamicField(index, { max: Number(e.target.value) })
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                placeholder="100"
                              />
                            </div>
                          </>
                        )}

                        {/* Placeholder */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Placeholder Text
                          </label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) =>
                              updateDynamicField(index, { placeholder: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder="Enter value..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            {dynamicFields.length > 0 && (
              <div
                onClick={addDynamicField}
                className="text-center text-xl cursor-pointer text-blue-600"
              >
                Add more field
              </div>
            )}
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
                <span>{category ? 'Update' : 'Create'} Category</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
