// src/hooks/useBrandImages.ts

import { useState, useEffect, useCallback } from 'react';
import { brandImagesService } from '@/services/brandImageServices.ts';
import type { BrandImage } from '@/types/brand.types.ts';

export function useBrandImages() {
  const [brands, setBrands] = useState<BrandImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandImagesService.getAll();
      setBrands(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch brand images';
      setError(errorMessage);
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBrand = async (file: File, brandName: string): Promise<BrandImage | null> => {
    try {
      const newBrand = await brandImagesService.create(file, brandName);
      await fetchBrands();
      return newBrand;
    } catch (err: any) {
      console.error('Error creating brand:', err);
      return null;
    }
  };

  const updateBrand = async (
    id: string,
    brandName?: string,
    file?: File
  ): Promise<BrandImage | null> => {
    try {
      const updatedBrand = await brandImagesService.update(id, brandName, file);
      await fetchBrands();
      return updatedBrand;
    } catch (err: any) {
      console.error('Error updating brand:', err);
      return null;
    }
  };

  const deleteBrand = async (id: string): Promise<boolean> => {
    try {
      await brandImagesService.delete(id);
      await fetchBrands();
      return true;
    } catch (err: any) {
      console.error('Error deleting brand:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  };
}
