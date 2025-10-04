export type VendorCategory =
  | 'food_beverage'
  | 'home_services'
  | 'health_wellness'
  | 'automotive'
  | 'education'
  | 'event_services'
  | 'beauty_personal'
  | 'professional_services'
  | 'retail'
  | 'technology'
  | 'construction'
  | 'other';

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export type UserRole = 'admin' | 'vendor' | 'user';

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number?: number;
  pincode?: number;
  address?: string;
  city?: string;
  state?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  category: VendorCategory;
  description?: string;
  phone_number: number;
  email?: string;
  pincode: number;
  address: string;
  city: string;
  state: string;
  business_image_url?: string;
  is_verified: boolean;
  rating_average: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  vendor_id: string;
  service_name: string;
  description?: string;
  price_range?: string;
  duration?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  id: string;
  user_id: string;
  vendor_id: string;
  service_id?: string;
  booking_date: string;
  booking_time: string;
  message?: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  vendor_id: string;
  booking_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export const CATEGORY_LABELS: Record<VendorCategory, string> = {
  food_beverage: 'Food & Beverage',
  home_services: 'Home Services',
  health_wellness: 'Health & Wellness',
  automotive: 'Automotive',
  education: 'Education',
  event_services: 'Event Services',
  beauty_personal: 'Beauty & Personal Care',
  professional_services: 'Professional Services',
  retail: 'Retail',
  technology: 'Technology',
  construction: 'Construction',
  other: 'Other',
};
