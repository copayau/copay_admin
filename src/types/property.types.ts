import { z } from 'zod';

export const PropertyStatusEnum = z.enum(['available', 'sold', 'pending', 'draft']);

export const propertySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  status: PropertyStatusEnum,
  address: z.string().min(5, 'Address is required'),
  short_text: z.string().max(300, 'Short text must be less than 300 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  share_price_guide: z.number().positive('Share price must be positive').optional(),
  total_shares: z.number().int().positive().optional(),
  propertyType: z.string().min(1, 'Property type is required'),
  completion: z.string().optional(),
  specific_item: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  bedrooms: z.number().int().min(0, 'Bedrooms must be 0 or more'),
  bathrooms: z.number().int().min(0, 'Bathrooms must be 0 or more'),
  garages: z.number().int().min(0, 'Garages must be 0 or more').optional(),
  features: z.array(z.string()).optional(),
  feature_image: z.string().url('Must be a valid URL').optional(),
  video_url: z.string().url('Must be a valid URL').optional(),
  published: z.boolean().default(false),
  area: z.string().optional(),
  location: z.string().optional(),
  agent_name: z.string().optional(),
  phone_number: z.string().optional(),
  company_name: z.string().optional(),
  shares: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Property = z.infer<typeof propertySchema>;
export type PropertyStatus = z.infer<typeof PropertyStatusEnum>;
export type PropertyFormData = Omit<Property, 'id' | 'created_at' | 'updated_at'>;
