import { z } from 'zod';
export const AssetStatusEnum = z.enum(['draft', 'available', 'pending', 'sold']);

export const assetSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid('Category is required'),

  // Core fields
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().optional(),

  // Pricing
  price: z.number().positive('Price must be positive'),
  share_price_guide: z.number().positive().optional(),
  total_shares: z.number().int().positive().optional(),

  // Media
  feature_image: z.string().url().optional(),
  images: z.array(z.string().url()).default([]),
  video_url: z.string().url().optional(),

  // Location
  address: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('Australia'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location: z.string().optional(),
  area: z.string().optional(),

  // Dynamic data
  dynamic_data: z.record(z.any()).default({}),

  // Status
  status: AssetStatusEnum.default('draft'),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),

  // Agent
  agent_name: z.string().optional(),
  phone_number: z.string().optional(),
  company_name: z.string().optional(),

  // SEO
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  tags: z.array(z.string()).default([]),

  // Timestamps
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Asset = z.infer<typeof assetSchema>;
export type AssetStatus = z.infer<typeof AssetStatusEnum>;
export type AssetFormData = Omit<Asset, 'id' | 'created_at' | 'updated_at'>;
