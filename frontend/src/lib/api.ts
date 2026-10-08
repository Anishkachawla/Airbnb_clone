/**
 * Thin typed client for the FastAPI backend. Auth is mocked: the selected demo user's id is kept in
 * localStorage and sent as the X-User-Id header on every request.
 */
import type {
  BookedRange, Booking, ListingCard, ListingDetail, ListingInput, ListingPage, Meta, Quote, Review,
  SearchParams, User,
} from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
export const USER_STORAGE_KEY = "demo-user-id";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function currentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(USER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(API_URL + path);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  return url.toString();
}

/** FastAPI returns `detail` as a string for HTTPException and as a list for validation errors. */
function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown })?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg).replace(/^Value error, /, "");
  return fallback;
}

async function request<T>(path: string, init: RequestInit & { query?: Query; json?: unknown } = {}): Promise<T> {
  const { query, json, headers, ...rest } = init;
  const userId = currentUserId();
  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      ...rest,
      headers: {
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(userId ? { "X-User-Id": userId } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, errorMessage(body, `Request failed (${res.status})`));
  return body as T;
}

function searchQuery(p: SearchParams, page: number, pageSize: number): Query {
  return {
    location: p.location,
    check_in: p.check_in,
    check_out: p.check_out,
    guests: p.guests,
    category: p.category,
    property_types: p.property_types?.join(","),
    min_price: p.min_price,
    max_price: p.max_price,
    bedrooms: p.bedrooms,
    amenities: p.amenities?.join(","),
    page,
    page_size: pageSize,
  };
}

export const api = {
  listings: {
    search: (params: SearchParams, page = 1, pageSize = 18) =>
      request<ListingPage>("/listings", { query: searchQuery(params, page, pageSize) }),
    get: (id: number) => request<ListingDetail>(`/listings/${id}`),
    availability: (id: number) => request<BookedRange[]>(`/listings/${id}/availability`),
    quote: (id: number, checkIn: string, checkOut: string, guests: number) =>
      request<Quote>(`/listings/${id}/quote`, { query: { check_in: checkIn, check_out: checkOut, guests } }),
    create: (data: ListingInput) => request<ListingDetail>("/listings", { method: "POST", json: data }),
    update: (id: number, data: ListingInput) => request<ListingDetail>(`/listings/${id}`, { method: "PUT", json: data }),
    remove: (id: number) => request<void>(`/listings/${id}`, { method: "DELETE" }),
  },
  bookings: {
    create: (data: { listing_id: number; check_in: string; check_out: string; guests: number }) =>
      request<Booking>("/bookings", { method: "POST", json: data }),
    mine: () => request<Booking[]>("/bookings/mine"),
    get: (id: number) => request<Booking>(`/bookings/${id}`),
    cancel: (id: number) => request<Booking>(`/bookings/${id}/cancel`, { method: "POST" }),
  },
  reviews: {
    create: (data: { booking_id: number; rating: number; comment: string }) =>
      request<Review>("/reviews", { method: "POST", json: data }),
  },
  users: {
    list: () => request<User[]>("/users"),
    me: () => request<User>("/me"),
    becomeHost: () => request<User>("/me/become-host", { method: "POST" }),
  },
  wishlist: {
    list: () => request<ListingCard[]>("/me/wishlist"),
    add: (listingId: number) => request<void>(`/me/wishlist/${listingId}`, { method: "PUT" }),
    remove: (listingId: number) => request<void>(`/me/wishlist/${listingId}`, { method: "DELETE" }),
  },
  host: {
    listings: () => request<ListingCard[]>("/host/listings"),
    reservations: () => request<Booking[]>("/host/reservations"),
  },
  /** Enums, amenities (with sections) and the price range, for filters and the host form. */
  meta: () => request<Meta>("/meta"),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ url: string }>("/uploads", { method: "POST", body: form });
  },
};
