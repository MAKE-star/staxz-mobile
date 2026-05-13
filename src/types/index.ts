export type UserRole = 'hirer' | 'provider' | 'admin';
export type ServiceMode = 'home' | 'walkin';
export type BookingStatus =
  | 'pending_payment' | 'confirmed' | 'in_progress'
  | 'completed' | 'disputed' | 'cancelled' | 'refunded';
export type EnquiryStatus = 'pending' | 'quoted' | 'accepted' | 'expired' | 'declined';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export interface Provider {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'salon' | 'independent';
  cac_verified: boolean;
  whatsapp_number: string;
  location_text: string | null;
  location_lat: number | null;
  location_lng: number | null;
  service_modes: ServiceMode[];
  base_fee_kobo: number;
  service_categories: string[];
  rating_avg: number;
  rating_count: number;
  is_live: boolean;
  bio: string | null;
  years_experience: number | null;
  distance_km?: number;
  owner_name?: string;
  portfolioPhotos?: PortfolioPhoto[];
}

export interface PortfolioPhoto {
  id: string;
  provider_id: string;
  category_id: string;
  url: string;
}

export interface Enquiry {
  id: string;
  hirer_id: string;
  provider_id: string;
  category_id: string;
  service_type: ServiceMode;
  status: EnquiryStatus;
  quote_kobo: number | null;
  quote_expires_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  reference: string;
  hirer_id: string;
  provider_id: string;
  service_type: ServiceMode;
  service_address: string | null;
  provider_quote_kobo: number;
  platform_fee_kobo: number;
  total_charged_kobo: number;
  status: BookingStatus;
  scheduled_at: string | null;
  completed_at: string | null;
  confirmed_at: string | null;
  paystack_ref: string | null;
  escrow_released: boolean;
  notes: string | null;
  created_at: string;
  hirer_name?: string;
  provider_name?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  stars: number;
  body: string | null;
  reviewer_name?: string;
  reviewer_avatar?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, string>;
  is_read: boolean;
  created_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
