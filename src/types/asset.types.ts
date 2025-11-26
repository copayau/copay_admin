import { z } from 'zod';

export const AssetStatusEnum = z.enum(['draft', 'available', 'pending', 'sold']);

const emptyStringToUndefined = z
  .string()
  .nullable()
  .transform((val) => (val === '' || val === null ? undefined : val))
  .optional();

const urlOrEmpty = z
  .string()
  .transform((val) => (val === '' ? undefined : val))
  .refine((val) => !val || z.string().url().safeParse(val).success, 'Invalid URL format')
  .optional();

export const assetSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid('Category is required'),

  // Core fields
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: emptyStringToUndefined,

  // Pricing
  price: z.number().positive('Price must be positive'),
  share_price_guide: z.number().optional(),
  total_shares: z.number().int().positive().optional(),

  // Media
  feature_image: urlOrEmpty,
  images: z.array(z.string().url()).default([]),

  // Location
  address: emptyStringToUndefined,
  state: emptyStringToUndefined,
  country: z.string().default('Australia'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  location: emptyStringToUndefined,
  area: emptyStringToUndefined,

  // Dynamic data
  dynamic_data: z.record(z.string(), z.any()).default({}),

  // Status
  status: AssetStatusEnum.default('draft'),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),

  // Agent
  agent_name: emptyStringToUndefined,
  phone_number: emptyStringToUndefined,
  company_name: emptyStringToUndefined,

  // SEO
  meta_title: emptyStringToUndefined,
  meta_description: emptyStringToUndefined,
  keywords: emptyStringToUndefined,
  tags: emptyStringToUndefined,

  // Timestamps
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const assetFormSchema = assetSchema.omit({ id: true, created_at: true, updated_at: true });

export type Asset = z.infer<typeof assetSchema>;

export type AssetStatus = z.infer<typeof AssetStatusEnum>;
export type AssetFormData = z.infer<typeof assetFormSchema>;
export type AssetFormParsed = z.infer<typeof assetFormSchema>;
