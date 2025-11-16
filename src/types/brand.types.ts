// types/`brand-images.ts

export interface BrandImage {
  id: string;
  brand_name: string;
  brand_image_url: string;
  brand_image_path: string;
  created_at: string;
  updated_at: string;
}

export interface BrandImageInsert {
  brand_name: string;
  brand_image_url: string;
  brand_image_path: string;
}

export interface BrandImageUpdate {
  brand_name?: string;
  brand_image_url?: string;
  brand_image_path?: string;
}
