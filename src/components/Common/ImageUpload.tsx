// src/components/ImageUpload/ImageUpload.tsx
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/services/supabase/client';

export interface UploadedImage {
  id: string;
  url: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  folder?: string;
  bucketName?: string;
  multiple?: boolean;
  showPreview?: boolean;
  uploadOnSelect?: boolean;
  className?: string;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  folder = 'uploads',
  bucketName = 'images',
  multiple = true,
  showPreview = true,
  uploadOnSelect = false,
  className = '',
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid format. Accepted: ${acceptedFormats.map((f) => f.split('/')[1].toUpperCase()).join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Max size: ${maxSizeMB}MB`;
    }
    return null;
  };

  // Upload single file to Supabase
  const uploadToSupabase = async (file: File, imageId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${generateId()}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Update progress
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, status: 'uploading', progress: 0 } : img))
    );

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setImages((prev) =>
          prev.map((img) => (img.id === imageId ? { ...img, progress: i } : img))
        );
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, status: 'success', progress: 100, url: publicUrl } : img
        )
      );

      return publicUrl;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, status: 'error', error: errorMsg } : img))
      );
      throw error;
    }
  };

  // Handle file selection
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      // Check max files limit
      if (images.length + fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} images allowed`);
        return;
      }

      // Validate and create image objects
      const newImages: UploadedImage[] = [];

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          alert(error);
          continue;
        }

        const id = generateId();
        const preview = URL.createObjectURL(file);

        newImages.push({
          id,
          url: '',
          file,
          preview,
          status: 'pending',
          progress: 0,
        });
      }

      setImages((prev) => [...prev, ...newImages]);

      // Auto-upload if enabled
      if (uploadOnSelect) {
        for (const image of newImages) {
          try {
            const url = await uploadToSupabase(image.file, image.id);
            onChange([...value, url]);
          } catch (error) {
            console.error('Upload failed:', error);
          }
        }
      }
    },
    [images.length, maxFiles, uploadOnSelect, value, onChange]
  );

  // Handle manual upload
  const handleUploadAll = async () => {
    const pendingImages = images.filter((img) => img.status === 'pending');
    const uploadedUrls: string[] = [];

    for (const image of pendingImages) {
      try {
        const url = await uploadToSupabase(image.file, image.id);
        uploadedUrls.push(url);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...value, ...uploadedUrls]);
    }
  };

  // Handle remove image
  const handleRemove = (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (image) {
      URL.revokeObjectURL(image.preview);
      setImages((prev) => prev.filter((img) => img.id !== imageId));

      if (image.status === 'success') {
        onChange(value.filter((url) => url !== image.url));
      }
    }
  };

  // Handle retry upload
  const handleRetry = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (image) {
      try {
        const url = await uploadToSupabase(image.file, imageId);
        onChange([...value, url]);
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const pendingCount = images.filter((img) => img.status === 'pending').length;
  const successCount = images.filter((img) => img.status === 'success').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Click to upload
              </button>
              <span className="text-slate-600"> or drag and drop</span>
            </div>

            <p className="text-sm text-slate-500">
              {acceptedFormats.map((f) => f.split('/')[1].toUpperCase()).join(', ')} up to{' '}
              {maxSizeMB}MB
              {multiple && ` (max ${maxFiles} files)`}
            </p>
          </div>
        </div>

        {isDragging && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-xl flex items-center justify-center">
            <p className="text-lg font-medium text-blue-600">Drop files here</p>
          </div>
        )}
      </div>

      {/* Preview Grid */}
      {showPreview && images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              {images.length} {images.length === 1 ? 'file' : 'files'} selected
              {successCount > 0 && ` • ${successCount} uploaded`}
            </p>

            {!uploadOnSelect && pendingCount > 0 && (
              <button
                type="button"
                onClick={handleUploadAll}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload All ({pendingCount})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50"
              >
                {/* Image Preview */}
                <div className="aspect-square relative">
                  <img src={image.preview} alt="Preview" className="w-full h-full object-cover" />

                  {/* Status Overlay */}
                  {image.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-center">
                        <svg
                          className="animate-spin h-8 w-8 text-white mx-auto mb-2"
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
                        <p className="text-white text-xs font-medium">{image.progress}%</p>
                      </div>
                    </div>
                  )}

                  {image.status === 'success' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}

                  {image.status === 'error' && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center p-2">
                      <div className="text-center">
                        <svg
                          className="w-8 h-8 text-white mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-white text-xs">{image.error}</p>
                      </div>
                    </div>
                  )}

                  {/* Hover Actions */}
                  {image.status !== 'uploading' && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        {image.status === 'error' && (
                          <button
                            type="button"
                            onClick={() => handleRetry(image.id)}
                            className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                            title="Retry"
                          >
                            <svg
                              className="w-5 h-5 text-slate-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(image.id)}
                          className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove"
                        >
                          <svg
                            className="w-5 h-5 text-red-600"
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
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-2 border-t border-slate-200">
                  <p className="text-xs text-slate-600 truncate" title={image.file.name}>
                    {image.file.name}
                  </p>
                  <p className="text-xs text-slate-500">{(image.file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Messages */}
      {images.length === 0 && (
        <p className="text-sm text-slate-500 text-center">No images selected yet</p>
      )}
    </div>
  );
}
