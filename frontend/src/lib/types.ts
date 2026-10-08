// Mirrors backend/app/schemas.py

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  is_host: boolean;
  is_superhost: boolean;
  created_at: string;
}

/** What other people may see about a user (no email). */
export type Host = Pick<User, "id" | "name" | "avatar_url" | "bio" | "is_superhost" | "created_at">;

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  section: string;
}

export interface Meta {
  property_types: string[];
  categories: string[];
  amenities: Amenity[];
  price_min: number;
  price_max: number;
}

export interface HostStats {
  listing_count: number;
  review_count: number;
  rating: number | null;
}

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  state: string | null;
  country: string;
  property_type: string;
  category: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  bedrooms: number;
  beds: number;
  images: string[];
  rating: number | null;
  review_count: number;
  host_name: string;
  is_superhost: boolean;
  is_wishlisted: boolean;
  /** All-in price (nightly × nights + cleaning + service fee) for the searched dates, or 2 nights. */
  stay_nights: number;
  stay_total: number;
}

export interface ListingPage {
  items: ListingCard[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: Host;
}

export interface ListingDetail {
  id: number;
  host_id: number;
  title: string;
  description: string;
  property_type: string;
  category: string;
  address: string | null;
  city: string;
  state: string | null;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  min_nights: number;
  host: Host;
  images: { id: number; url: string; position: number }[];
  amenities: Amenity[];
  reviews: Review[];
  rating: number | null;
  review_count: number;
  is_wishlisted: boolean;
  host_stats: HostStats | null;
}

export interface ListingInput {
  title: string;
  description: string;
  property_type: string;
  category: string;
  address: string | null;
  city: string;
  state: string | null;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  min_nights: number;
  image_urls: string[];
  amenity_ids: number[];
}

export interface BookedRange {
  check_in: string;
  check_out: string;
}

export interface Quote {
  nightly_rate: number;
  nights: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total: number;
}

export interface Booking {
  id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nightly_rate: number;
  nights: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: "confirmed" | "cancelled";
  created_at: string;
  has_review: boolean;
  listing: {
    id: number;
    title: string;
    city: string;
    state: string | null;
    country: string;
    property_type: string;
    address: string | null;
    cover_image: string | null;
    host: Host;
  };
  guest: { id: number; name: string; avatar_url: string | null };
}

export interface SearchParams {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  category?: string;
  property_types?: string[];
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  amenities?: number[];
}
