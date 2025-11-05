import { supabase } from '@/services/supabase/client';

export const uploadPropertyImage = async (
  file: File,
  folder: string = 'property-images'
): Promise<string> => {
  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('property-images').getPublicUrl(filePath);

  return publicUrl;
};

export const deletePropertyImage = async (url: string): Promise<void> => {
  try {
    // Extract path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/storage/v1/object/public/images/');
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];

    const { error } = await supabase.storage.from('property-images').remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete image:', error);
    throw error;
  }
};
