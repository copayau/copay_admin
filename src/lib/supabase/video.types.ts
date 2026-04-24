export interface Video {
  id: string;
  title: string;
  slug: string;
  url: string;
  thumbnail_url: string | null;
  description: string | null;
  category: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoFormData {
  title: string;
  slug: string;
  url: string;
  thumbnail_url?: string;
  description?: string;
  category: string;
  published: boolean;
}
