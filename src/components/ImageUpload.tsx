// src/components/ImageUpload.tsx
import { useState, useRef } from 'react';
import { Upload, X, ZoomIn } from 'lucide-react';

interface ImageUploadProps {
  value: string | undefined;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  aspectRatio?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onUpload,
  label = 'Upload Image',
  aspectRatio = '16/9',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploading(true);
      const url = await onUpload(file);
      onChange(url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="space-y-2">
        {/* Upload Area */}
        {!value ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100"
            style={{ aspectRatio: aspectRatio }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 font-medium">{label}</p>
              <p className="text-xs text-slate-500 mt-1">Click to browse</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          /* Image Preview */
          <div className="relative group">
            {/* Small Preview Container */}
            <div
              className="relative border border-slate-300 rounded-lg overflow-hidden bg-slate-100"
              style={{ height: '200px' }}
            >
              <img src={value} alt="Preview" className="w-full h-full object-cover" />

              {/* Overlay with Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                {/* Zoom Button */}
                <button
                  type="button"
                  onClick={() => setShowDialog(true)}
                  className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors shadow-lg"
                  title="View full size"
                >
                  <ZoomIn className="w-5 h-5 text-slate-700" />
                </button>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors shadow-lg"
                  title="Remove image"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>

              {/* Uploading Overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-slate-600 mt-2">Uploading...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Change Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Full Size Image Dialog */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setShowDialog(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowDialog(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition-colors"
              title="Close"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Full Size Image */}
            <img
              src={value}
              alt="Full size preview"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
