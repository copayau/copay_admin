// src/services/brandImagesService.ts

import { supabase } from '@/services/supabase/client.ts';
import type { BrandImage, BrandImageUpdate } from '@/types/brand.types.ts';

export const brandImagesService = {
  // Get all brand images
  async getAll(): Promise<BrandImage[]> {
    const { data, error } = await supabase
      .from('brand_images')
      .select('*')
      .order('brand_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get single brand image by ID
  async getById(id: string): Promise<BrandImage | null> {
    const { data, error } = await supabase.from('brand_images').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  },

  // Upload image to Supabase storage
  async uploadImage(file: File): Promise<{ path: string; url: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

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

    return { path: filePath, url: publicUrl };
  },

  // Delete image from storage
  async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage.from('property-images').remove([path]);

    if (error) throw error;
  },

  // Create new brand image
  async create(file: File, brandName: string): Promise<BrandImage> {
    // First upload the image
    const { path, url } = await this.uploadImage(file);

    try {
      // Then create database record
      const { data, error } = await supabase
        .from('brand_images')
        .insert({
          brand_name: brandName,
          brand_image_url: url,
          brand_image_path: path,
        })
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if database insert fails
        await this.deleteImage(path);
        throw error;
      }

      return data;
    } catch (error) {
      // Clean up uploaded file on any error
      await this.deleteImage(path);
      throw error;
    }
  },

  // Update brand image
  async update(id: string, brandName?: string, file?: File): Promise<BrandImage> {
    // Get existing brand to find old image path
    const existingBrand = await this.getById(id);
    if (!existingBrand) throw new Error('Brand image not found');

    let updateData: BrandImageUpdate = {};

    // Update brand name if provided
    if (brandName) {
      updateData.brand_name = brandName;
    }

    // If new file provided, upload and replace
    if (file) {
      const { path, url } = await this.uploadImage(file);
      updateData.brand_image_url = url;
      updateData.brand_image_path = path;

      // Delete old image after successful upload
      try {
        await this.deleteImage(existingBrand.brand_image_path);
      } catch (error) {
        console.error('Error deleting old image:', error);
        // Continue even if old image deletion fails
      }
    }

    // Update database
    const { data, error } = await supabase
      .from('brand_images')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete brand image (including storage file)
  async delete(id: string): Promise<void> {
    // First get the image path
    const brandImage = await this.getById(id);
    if (!brandImage) throw new Error('Brand image not found');

    // Delete from storage
    await this.deleteImage(brandImage.brand_image_path);

    // Delete from database
    const { error } = await supabase.from('brand_images').delete().eq('id', id);

    if (error) throw error;
  },
};
