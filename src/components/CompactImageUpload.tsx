import React, { useState, useRef } from 'react';

interface CompactImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
}

export default function CompactImageUpload({
  value = [],
  onChange,
  onUpload,
  label = 'Images',
  maxFiles = 10,
  maxSize = 5,
  multiple = true,
}: CompactImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max files
    if (value.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files allowed');
        }
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File size must be less than ${maxSize}MB`);
        }

        // Upload
        return await onUpload(file);
      });

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const urls = await Promise.all(uploadPromises);
      clearInterval(interval);
      setUploadProgress(100);

      onChange([...value, ...urls]);

      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handlePreview = (url: string) => {
    setPreviewImage(url);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      <div className="flex flex-wrap gap-2">
        {/* Existing Images */}
        {value.map((url, index) => (
          <div
            key={index}
            className="relative group w-20 h-20 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50"
          >
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => handlePreview(url)}
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Preview icon */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {value.length < maxFiles && !uploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <svg
              className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}

        {/* Uploading State */}
        {uploading && (
          <div className="w-20 h-20 border-2 border-blue-300 rounded-lg flex flex-col items-center justify-center bg-blue-50">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
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
            <span className="text-xs text-blue-600 mt-1">{uploadProgress}%</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {value.length}/{maxFiles} images
        </span>
        <span>Max {maxSize}MB each</span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
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
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// src/components/ImageUpload/CompactSingleImageUpload.tsx
// For single image upload (like feature image)

interface CompactSingleImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  maxSize?: number;
}

export function CompactSingleImageUpload({
  value,
  onChange,
  onUpload,
  label = 'Image',
  maxSize = 5,
}: CompactSingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Only image files allowed');
      return;
    }
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const url = await onUpload(file);
      clearInterval(interval);
      setUploadProgress(100);

      onChange(url);

      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      <div className="flex items-center gap-3">
        {/* Image Preview/Upload */}
        {value ? (
          <div className="relative group">
            <div className="w-24 h-24 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setPreviewImage(value)}
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 bg-white text-slate-700 rounded hover:bg-slate-100 transition-colors"
                    title="Change"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : uploading ? (
          <div className="w-24 h-24 border-2 border-blue-300 rounded-lg flex flex-col items-center justify-center bg-blue-50">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
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
            <span className="text-xs text-blue-600 mt-1">{uploadProgress}%</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <svg
              className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-xs text-slate-500 mt-1">Upload</span>
          </button>
        )}

        {/* Info */}
        <div className="flex-1">
          <p className="text-xs text-slate-600">
            {value ? 'Click image to preview' : 'Click to upload image'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">PNG, JPG, WebP • Max {maxSize}MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
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
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
