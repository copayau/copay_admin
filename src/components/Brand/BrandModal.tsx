// src/components/BrandImages/BrandImageModal.tsx

import { useState, useEffect } from 'react';
import type { BrandImage } from '@/types/brand.types.ts';

interface BrandImageModalProps {
  brand: BrandImage | null;
  onClose: () => void;
  onSubmit: (brandName: string, file: File | null) => Promise<void>;
}

export default function BrandImageModal({ brand, onClose, onSubmit }: BrandImageModalProps) {
  const [brandName, setBrandName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (brand) {
      setBrandName(brand.brand_name);
      setPreviewUrl(brand.brand_image_url);
    }
  }, [brand]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandName.trim()) {
      alert('Brand name is required');
      return;
    }

    if (!brand && !file) {
      alert('Image file is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(brandName, file);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {brand ? 'Edit Brand Image' : 'Add New Brand Image'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Brand Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter brand name"
              required
              disabled={submitting}
            />
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Logo {brand && '(Leave empty to keep current)'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={submitting}
            />
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div className="w-full h-40 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center p-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : brand ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
