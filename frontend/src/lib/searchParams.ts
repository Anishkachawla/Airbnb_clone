/** Explore-page state lives in the URL so searches are shareable and survive refresh/back. */
import { isISODate } from "./dates";
import { plural } from "./format";
import type { SearchParams } from "./types";

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface ExploreState {
  location: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: GuestCounts;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  types: string[];
  bedrooms: number;
  amenities: number[];
}

export const EMPTY_GUESTS: GuestCounts = { adults: 0, children: 0, infants: 0, pets: 0 };

const int = (v: string | null) => (v && /^\d+$/.test(v) ? Number(v) : null);
const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function parseExplore(sp: URLSearchParams): ExploreState {
  const checkIn = sp.get("checkIn");
  const checkOut = sp.get("checkOut");
  const validDates = isISODate(checkIn) && isISODate(checkOut) && checkOut > checkIn;
  return {
    location: sp.get("location") ?? "",
    checkIn: validDates ? checkIn : null,
    checkOut: validDates ? checkOut : null,
    guests: {
      adults: int(sp.get("adults")) ?? 0,
      children: int(sp.get("children")) ?? 0,
      infants: int(sp.get("infants")) ?? 0,
      pets: int(sp.get("pets")) ?? 0,
    },
    category: sp.get("category"),
    minPrice: int(sp.get("minPrice")),
    maxPrice: int(sp.get("maxPrice")),
    types: list(sp.get("types")),
    bedrooms: int(sp.get("bedrooms")) ?? 0,
    amenities: list(sp.get("amenities")).map(Number).filter(Number.isFinite),
  };
}

export function toQueryString(s: ExploreState): string {
  const q = new URLSearchParams();
  if (s.location.trim()) q.set("location", s.location.trim());
  if (s.checkIn && s.checkOut) {
    q.set("checkIn", s.checkIn);
    q.set("checkOut", s.checkOut);
  }
  (Object.keys(s.guests) as (keyof GuestCounts)[]).forEach((k) => s.guests[k] > 0 && q.set(k, String(s.guests[k])));
  if (s.category) q.set("category", s.category);
  if (s.minPrice !== null) q.set("minPrice", String(s.minPrice));
  if (s.maxPrice !== null) q.set("maxPrice", String(s.maxPrice));
  if (s.types.length) q.set("types", s.types.join(","));
  if (s.bedrooms) q.set("bedrooms", String(s.bedrooms));
  if (s.amenities.length) q.set("amenities", s.amenities.join(","));
  const str = q.toString();
  return str ? `?${str}` : "";
}

/** Infants and pets don't count towards a listing's guest limit (same as Airbnb). */
export const guestTotal = (g: GuestCounts) => g.adults + g.children;

export function toApiParams(s: ExploreState): SearchParams {
  const guests = guestTotal(s.guests);
  return {
    location: s.location || undefined,
    check_in: s.checkIn ?? undefined,
    check_out: s.checkOut ?? undefined,
    guests: guests || undefined,
    category: s.category ?? undefined,
    min_price: s.minPrice ?? undefined,
    max_price: s.maxPrice ?? undefined,
    property_types: s.types.length ? s.types : undefined,
    bedrooms: s.bedrooms || undefined,
    amenities: s.amenities.length ? s.amenities : undefined,
  };
}

export function guestLabel(g: GuestCounts, empty = "Add guests"): string {
  const total = guestTotal(g);
  if (!total) return empty;
  const parts = [plural(total, "guest")];
  if (g.infants) parts.push(plural(g.infants, "infant"));
  if (g.pets) parts.push(plural(g.pets, "pet"));
  return parts.join(", ");
}

export const activeFilterCount = (s: ExploreState) =>
  (s.minPrice !== null || s.maxPrice !== null ? 1 : 0) + s.types.length + (s.bedrooms ? 1 : 0) + s.amenities.length;
