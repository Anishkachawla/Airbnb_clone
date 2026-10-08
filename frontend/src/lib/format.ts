export const BRAND_NAME = "airbnb";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const price = (n: number) => inr.format(n);

export const plural = (n: number, word: string, pluralWord = `${word}s`) => `${n} ${n === 1 ? word : pluralWord}`;

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const location = (l: { city: string; state?: string | null; country: string }) =>
  l.country === "India" && l.state ? `${l.city}, ${l.state}` : `${l.city}, ${l.country}`;

export const rating = (r: number | null) => (r === null ? "New" : r.toFixed(r % 1 === 0 ? 1 : 2));

export const firstName = (name: string) => name.split(" ")[0];

/** Airbnb's "Guest favourite" badge: top-rated homes with enough reviews. */
export const isGuestFavorite = (r: number | null, count: number) => r !== null && r >= 4.7 && count >= 3;

/** How Airbnb India labels property types on cards ("Home in Goa", "Flat in Mumbai"). */
const TYPE_LABELS: Record<string, string> = { house: "Home", apartment: "Flat", guesthouse: "Guest house" };
export const typeLabel = (t: string) => TYPE_LABELS[t] ?? capitalize(t);
