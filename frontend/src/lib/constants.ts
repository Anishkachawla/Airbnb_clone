import type { IconName } from "@/components/ui/Icon";

export interface Category {
  key: string;
  label: string;
  icon: IconName;
}

// Keys match `listings.category` in the backend
export const CATEGORIES: Category[] = [
  { key: "beach", label: "Beachfront", icon: "cat-beach" },
  { key: "cabins", label: "Cabins", icon: "cat-cabin" },
  { key: "pools", label: "Amazing pools", icon: "cat-pool" },
  { key: "iconic", label: "Iconic cities", icon: "cat-city" },
  { key: "countryside", label: "Countryside", icon: "cat-countryside" },
  { key: "lakefront", label: "Lakefront", icon: "cat-lake" },
  { key: "tropical", label: "Tropical", icon: "cat-palm" },
  { key: "treehouses", label: "Treehouses", icon: "cat-tree" },
  { key: "design", label: "Design", icon: "cat-design" },
  { key: "mansions", label: "Mansions", icon: "cat-mansion" },
  { key: "tiny", label: "Tiny homes", icon: "cat-tiny" },
  { key: "skiing", label: "Skiing", icon: "cat-ski" },
];

export const PROPERTY_TYPES: { key: string; label: string; icon: IconName }[] = [
  { key: "house", label: "House", icon: "home" },
  { key: "apartment", label: "Apartment", icon: "cat-city" },
  { key: "villa", label: "Villa", icon: "cat-pool" },
  { key: "cabin", label: "Cabin", icon: "cat-cabin" },
  { key: "cottage", label: "Cottage", icon: "cat-countryside" },
  { key: "guesthouse", label: "Guesthouse", icon: "door" },
  { key: "tiny home", label: "Tiny home", icon: "cat-tiny" },
  { key: "treehouse", label: "Treehouse", icon: "cat-tree" },
  { key: "bungalow", label: "Bungalow", icon: "cat-palm" },
  { key: "boat", label: "Boat", icon: "cat-lake" },
  { key: "mansion", label: "Mansion", icon: "cat-mansion" },
];

export const REGIONS = [
  { label: "Goa", hint: "Beaches and Portuguese villas" },
  { label: "Kerala", hint: "Backwaters and tea estates" },
  { label: "Himachal Pradesh", hint: "Cabins in the mountains" },
  { label: "Italy", hint: "Coastal villas and farmhouses" },
  { label: "Japan", hint: "Machiya and design studios" },
  { label: "California", hint: "Desert, lakes and coast" },
];

export const IMAGE_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 380"><rect width="400" height="380" fill="#EBEBEB"/><path d="M150 230l50-60 40 45 25-28 45 43z" fill="#C4C4C4"/><circle cx="160" cy="150" r="18" fill="#C4C4C4"/></svg>`,
  );
