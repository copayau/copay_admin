import { z } from 'zod';

// Dynamic Field Types
export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date';

export interface DynamicField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select fields
  min?: number; // For number fields
  max?: number; // For number fields
  placeholder?: string;
}

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  dynamic_fields: z.array(z.any()).default([]),
  is_active: z.boolean().default(true),
  display_order: z.number().default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type CategoryFormData = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
