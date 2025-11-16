import { supabase } from '@/services/supabase/client.ts';
import type { BrandImage, BrandImageInsert, BrandImageUpdate } from '@/types/brand.types.ts';

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
    const filePath = `${fileName}`;

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
  async create(brandImage: BrandImageInsert): Promise<BrandImage> {
    const { data, error } = await supabase
      .from('brand_images')
      .insert(brandImage)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update brand image
  async update(id: string, updates: BrandImageUpdate): Promise<BrandImage> {
    const { data, error } = await supabase
      .from('brand_images')
      .update(updates)
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

  // Replace image (delete old, upload new)
  async replaceImage(oldPath: string, newFile: File): Promise<{ path: string; url: string }> {
    // Upload new image
    const newImage = await this.uploadImage(newFile);

    // Delete old image
    try {
      await this.deleteImage(oldPath);
    } catch (error) {
      console.error('Error deleting old image:', error);
      // Continue even if old image deletion fails
    }

    return newImage;
  },
};
