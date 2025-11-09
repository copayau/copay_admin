// src/pages/AssetFormPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assetFormSchema, type AssetFormData } from '../types/asset.types';
import { useAssetStore } from '@/store/assetStore';
import { useCategoryStore } from '@/store/categoryStore';
import CompactImageUpload from '@/components/CompactImageUpload';
import { supabase } from '@/services/supabase/client';
import type { DynamicField } from '../types/category.types';

const uploadAssetImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `asset-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('property-images').getPublicUrl(filePath);

  return publicUrl;
};

export default function AssetFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const { currentAsset, loading, fetchAssetById, createAsset, updateAsset } = useAssetStore();
  const { categories, fetchCategories } = useCategoryStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema) as unknown as Resolver<AssetFormData>,
    defaultValues: {
      category_id: '',
      title: '',
      slug: '',
      description: '',
      short_description: '',
      price: 0,
      share_price_guide: 0,
      total_shares: 0,
      feature_image: '',
      images: [],
      video_url: '',
      address: '',
      state: '',
      country: 'Australia',
      latitude: undefined,
      longitude: undefined,
      location: '',
      area: '',
      dynamic_data: {},
      status: 'draft',
      published: false,
      featured: false,
      agent_name: '',
      phone_number: '',
      company_name: '',
      meta_title: '',
      meta_description: '',
      tags: [],
    },
  });

  const title = watch('title');
  const categoryId = watch('category_id');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (id) {
      fetchAssetById(id);
    }
  }, [id, fetchAssetById]);

  useEffect(() => {
    if (currentAsset && id) {
      reset(currentAsset);
      setSelectedCategoryId(currentAsset.category_id);
      setDynamicFieldValues(currentAsset.dynamic_data || {});
    }
  }, [currentAsset, id, reset]);

  useEffect(() => {
    if (!id && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [title, id, setValue]);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }
  }, [categoryId]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const dynamicFields: DynamicField[] = selectedCategory?.dynamic_fields || [];

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const renderDynamicField = (field: DynamicField) => {
    const value = dynamicFieldValues[field.name] || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, Number(e.target.value))}
            min={field.min}
            max={field.max}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleDynamicFieldChange(field.name, e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-700">Yes</span>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  const onSubmit: SubmitHandler<AssetFormData> = async (data) => {
    try {
      // Merge dynamic fields, then parse with schema to apply defaults and ensure types
      const toValidate = {
        ...data,
        dynamic_data: dynamicFieldValues,
      };
      const parsed = assetFormSchema.parse(toValidate);

      if (id) {
        await updateAsset(id, parsed);
        alert('Asset updated successfully!');
      } else {
        await createAsset(parsed);
        alert('Asset created successfully!');
      }
      navigate('/assets');
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to save asset');
    }
  };

  if (loading && id) {
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
          <p className="text-slate-600">Loading asset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/assets')}
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
          <h2 className="text-2xl font-bold text-slate-800">
            {id ? 'Edit Asset' : 'Create New Asset'}
          </h2>
          <p className="text-slate-600 mt-1">Fill in the details below</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-8">
          {/* Category Selection */}
          <section className="space-y-4 pb-6 border-b border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800">Category Selection</h4>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Asset Category *
              </label>
              <select
                {...register('category_id')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {categories
                  .filter((c) => c.is_active)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.title}
                    </option>
                  ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
              )}
            </div>
          </section>

          {/* Images */}
          <section className="space-y-4 pb-6 border-b border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800">Images & Media</h4>

            <div className="space-y-4">
              {/* Feature Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Featured Image *
                </label>
                <Controller
                  name="feature_image"
                  control={control}
                  render={({ field }) => (
                    <CompactImageUpload
                      value={field.value ? [field.value] : []}
                      onChange={(urls) => field.onChange(urls[0] || '')}
                      onUpload={uploadAssetImage}
                      multiple={false}
                      maxFiles={1}
                    />
                  )}
                />
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gallery Images (Multiple)
                </label>
                <Controller
                  name="images"
                  control={control}
                  render={({ field }) => (
                    <CompactImageUpload
                      value={field.value || []}
                      onChange={field.onChange}
                      onUpload={uploadAssetImage}
                      multiple={true}
                      maxFiles={10}
                    />
                  )}
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Video URL</label>
                <input
                  {...register('video_url')}
                  type="url"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </section>

          {/* Basic Information */}
          <section className="space-y-4 pb-6 border-b border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800">Basic Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Asset title..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slug (URL) *
                </label>
                <input
                  {...register('slug')}
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="asset-slug"
                />
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status *</label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Short Description
                </label>
                <input
                  {...register('short_description')}
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="One-line summary..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Dynamic Category Fields */}
          {selectedCategoryId && dynamicFields.length > 0 && (
            <section className="space-y-4 pb-6 border-b border-slate-200">
              <h4 className="text-lg font-semibold text-slate-800">
                {selectedCategory?.title} Specific Fields
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dynamicFields.map((field) => (
                  <div
                    key={field.name}
                    className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {field.label} {field.required && '*'}
                    </label>
                    {renderDynamicField(field)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pricing */}
          <section className="space-y-4 pb-6 border-b border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800">Pricing</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price (AUD) *
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Share Price Guide
                </label>
                <input
                  {...register('share_price_guide', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Shares
                </label>
                <input
                  {...register('total_shares', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4 pb-6 border-b border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800">Location (Optional)</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <input
                  {...register('address')}
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                <select
                  {...register('state')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select State</option>
                  <option value="New South Wales">New South Wales</option>
                  <option value="Victoria">Victoria</option>
                  <option value="Queensland">Queensland</option>
                  <option value="South Australia">South Australia</option>
                  <option value="Western Australia">Western Australia</option>
                  <option value="Tasmania">Tasmania</option>
                  <option value="Northern Territory">Northern Territory</option>
                  <option value="Australian Capital Territory">Australian Capital Territory</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location/Suburb
                </label>
                <input
                  {...register('location')}
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bondi Beach"
                />
              </div>
            </div>
          </section>

          {/* Agent Info */}
          <section className="space-y-4 pb-6 border-b border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800">Agent Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Agent Name</label>
                <input
                  {...register('agent_name')}
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register('phone_number')}
                  type="tel"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+61 400 000 000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name
                </label>
                <input
                  {...register('company_name')}
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Real Estate Agency"
                />
              </div>
            </div>
          </section>

          {/* Publishing */}
          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800">Publishing</h4>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <Controller
                  name="published"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                  )}
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Publish this asset</span>
                  <p className="text-xs text-slate-500">Make visible to public</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <Controller
                  name="featured"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                  )}
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Featured asset</span>
                  <p className="text-xs text-slate-500">Show in featured section</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center bg-white rounded-xl border border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-600">* Required fields</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/assets')}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium shadow-lg"
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
              <span>{id ? 'Update' : 'Create'} Asset</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
