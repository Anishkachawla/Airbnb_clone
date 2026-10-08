import Link from "next/link";
import { HeartButton } from "@/components/ui/HeartButton";
import { StarSolid } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { isGuestFavorite, plural, price, rating, typeLabel } from "@/lib/format";
import type { ListingCard as Card } from "@/lib/types";
import { ImageCarousel } from "./ImageCarousel";

interface Props {
  listing: Card;
  /** Dates carried into the listing page (the price shown is for exactly these nights). */
  checkIn?: string | null;
  checkOut?: string | null;
  /** "row": compact two-line card used in the home carousels. "grid": search results with a little more detail. */
  variant?: "row" | "grid";
  /** Wishlist page removes the card when un-saved. */
  onWishlistChange?: (saved: boolean) => void;
}

export function ListingCard({ listing: l, checkIn, checkOut, variant = "grid", onWishlistChange }: Props) {
  const query = checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}` : "";
  // stay_total is computed by the API with the same formula as checkout, so "includes all fees" is true
  const priceLine = (
    <>
      <span className={variant === "grid" ? "font-semibold text-ink" : ""}>{price(l.stay_total)}</span> for {plural(l.stay_nights, "night")}
      <span aria-hidden="true"> · </span>
      <span className="inline-flex items-center gap-0.5">
        <StarSolid size={10} /> {rating(l.rating)}
      </span>
    </>
  );
  return (
    <Link href={`/rooms/${l.id}${query}`} className="group block">
      <div className="relative">
        {variant === "row" ? (
          // Rows scroll sideways, so their cards show one photo (like Airbnb) rather than a swipeable carousel
          <Img src={l.images[0] ?? ""} alt={l.title} className="aspect-[20/19] w-full rounded-[20px] bg-soft object-cover" />
        ) : (
          <ImageCarousel images={l.images} alt={l.title} />
        )}
        {isGuestFavorite(l.rating, l.review_count) && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-semibold leading-none text-[#222] shadow-pill">
            Guest favourite
          </span>
        )}
        <div className="absolute right-2.5 top-2.5">
          <HeartButton listingId={l.id} initial={l.is_wishlisted} image={l.images[0]} onChange={onWishlistChange} />
        </div>
      </div>
      <div className="mt-2.5 px-1 text-[15px] leading-[20px]">
        <h3 className="font-semibold">{typeLabel(l.property_type)} in {l.city}</h3>
        {variant === "grid" && (
          <>
            <p className="truncate text-muted">{l.title}</p>
            <p className="truncate text-muted">{plural(l.beds, "bed")} · {plural(l.bedrooms, "bedroom")}</p>
          </>
        )}
        <p className={`text-sm ${variant === "grid" ? "mt-1" : ""} text-muted`}>{priceLine}</p>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[20/19] rounded-[20px]" />
      <div className="skeleton mt-3 h-4 w-3/4 rounded" />
      <div className="skeleton mt-2 h-4 w-1/2 rounded" />
    </div>
  );
}

/** Airbnb's responsive grid: 1 → 2 → 3 → 4 → 5 → 6 columns. */
export const GRID = "grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 m2:grid-cols-3 l2:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6";
