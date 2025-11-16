// src/components/BrandImages/BrandImages.tsx

import { useState } from 'react';
import { useBrandImages } from '@/hooks/useBrandImage';
import BrandImagesTable from '@/components/Brand/BrandTable.tsx';
import BrandImageModal from '@/components/Brand/BrandModal.tsx';
import type { BrandImage } from '@/types/brand.types.ts';

export default function BrandImages() {
  const { brands, loading, createBrand, updateBrand, deleteBrand } = useBrandImages();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandImage | null>(null);

  const handleOpenModal = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleEdit = (brand: BrandImage) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, brandName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${brandName}"?`)) {
      return;
    }

    await deleteBrand(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const handleSubmit = async (brandName: string, file: File | null) => {
    if (editingBrand) {
      // Update existing brand
      const success = await updateBrand(editingBrand.id, brandName, file || undefined);
      if (success) {
        handleCloseModal();
      }
    } else {
      // Create new brand
      if (!file) {
        return;
      }
      const success = await createBrand(file, brandName);
      if (success) {
        handleCloseModal();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Brand Images</h1>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          Add New Brand
        </button>
      </div>

      <BrandImagesTable brands={brands} onEdit={handleEdit} onDelete={handleDelete} />

      {isModalOpen && (
        <BrandImageModal brand={editingBrand} onClose={handleCloseModal} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
