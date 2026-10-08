"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { HeartButton } from "@/components/ui/HeartButton";
import { Icon, StarSolid, type IconName } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { fmt, nightsBetween, yearsSince } from "@/lib/dates";
import { capitalize, firstName, isGuestFavorite, location, plural, price, rating } from "@/lib/format";
import type { BookedRange, ListingDetail } from "@/lib/types";
import { Amenities } from "./Amenities";
import { BookingCard } from "./BookingCard";
import { HostCard } from "./HostCard";
import { LocationMap } from "./LocationMap";
import { PhotoGrid } from "./PhotoGrid";
import { Laurel, Reviews } from "./Reviews";
import { ThingsToKnow } from "./ThingsToKnow";
import { useBookingSelection } from "./useBookingSelection";
import { Avatar } from "@/components/ui/Avatar";

export function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [ranges, setRanges] = useState<BookedRange[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.listings.get(Number(id)), api.listings.availability(Number(id))])
      .then(([l, r]) => {
        setListing(l);
        setRanges(r);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <>
        <Header variant="detail" />
        <div className="mx-auto flex max-w-detail flex-col items-start gap-4 px-6 py-24 lg:px-10">
          <h1 className="text-[32px] font-semibold">We can&apos;t seem to find that place</h1>
          <p className="text-muted">{error}</p>
          <Link href="/" className="btn-dark">Go home</Link>
        </div>
      </>
    );
  }
  if (!listing) return <ListingSkeleton />;
  return <ListingView listing={listing} ranges={ranges} />;
}

function ListingView({ listing: l, ranges }: { listing: ListingDetail; ranges: BookedRange[] }) {
  const router = useRouter();
  const toast = useToast();
  const { requireUser } = useAuth();
  const sel = useBookingSelection(l.id, ranges, l.min_nights);
  const [descOpen, setDescOpen] = useState(false);
  const [mobileDates, setMobileDates] = useState(false);
  const images = l.images.map((i) => i.url);
  const favorite = isGuestFavorite(l.rating, l.review_count);
  const amenityNames = new Set(l.amenities.map((a) => a.name));

  const reserve = () =>
    requireUser((user) => {
      if (user.id === l.host.id) {
        toast.error("You can't book your own listing");
        return;
      }
      if (!sel.checkIn || !sel.checkOut) return;
      const q = new URLSearchParams({ checkIn: sel.checkIn, checkOut: sel.checkOut, adults: String(sel.guests.adults) });
      if (sel.guests.children) q.set("children", String(sel.guests.children));
      if (sel.guests.infants) q.set("infants", String(sel.guests.infants));
      if (sel.guests.pets) q.set("pets", String(sel.guests.pets));
      router.push(`/book/${l.id}?${q}`);
    });

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.show("Link copied", { image: images[0] });
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const highlights: { icon: IconName; title: string; body: string }[] = [];
  if (l.host.is_superhost) highlights.push({ icon: "medal", title: `${firstName(l.host.name)} is a Superhost`, body: "Superhosts are experienced, highly rated hosts." });
  if (amenityNames.has("Self check-in")) highlights.push({ icon: "door", title: "Self check-in", body: "Check yourself in with the keypad." });
  if (amenityNames.has("Dedicated workspace")) highlights.push({ icon: "workspace", title: "Dedicated workspace", body: "A common area with wifi that's well-suited for working." });
  highlights.push({ icon: "calendar", title: "Free cancellation for 7 days before check-in", body: "Get a full refund if you change your mind." });

  const nights = sel.checkIn && sel.checkOut ? nightsBetween(sel.checkIn, sel.checkOut) : 0;

  return (
    <>
      <Header variant="detail" />
      <main className="mx-auto max-w-detail px-6 pb-28 md:pb-0 md:pt-6 lg:px-10">
        <div className="mb-6 hidden items-end justify-between md:flex">
          <h1 className="text-[26px] font-semibold">{l.title}</h1>
          <div className="flex gap-2">
            <button onClick={share} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold underline hover:bg-soft">
              <Icon name="share" size={16} /> Share
            </button>
            <HeartButton listingId={l.id} initial={l.is_wishlisted} image={images[0]} variant="inline" />
          </div>
        </div>

        <PhotoGrid
          images={images}
          title={l.title}
          overlay={
            <div className="absolute inset-x-0 top-0 flex justify-between p-4">
              <button onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#222] shadow-pill">
                <Icon name="chevron-left" size={14} strokeWidth={3} />
              </button>
              <div className="flex gap-3">
                <button onClick={share} aria-label="Share" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#222] shadow-pill"><Icon name="share" size={15} /></button>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-pill">
                  <HeartButton listingId={l.id} initial={l.is_wishlisted} image={images[0]} />
                </span>
              </div>
            </div>
          }
        />

        <div className="relative grid gap-x-20 md:grid-cols-[1fr_minmax(0,370px)] lg:gap-x-24">
          <div className="min-w-0">
            <section className="border-b border-line py-6 md:py-8">
              <h1 className="mb-2 text-[26px] font-semibold leading-tight md:hidden">{l.title}</h1>
              <h2 className="text-[22px] font-semibold">{capitalize(l.property_type)} in {location(l)}</h2>
              <p>{[plural(l.max_guests, "guest"), plural(l.bedrooms, "bedroom"), plural(l.beds, "bed"), plural(l.bathrooms, "bath")].join(" · ")}</p>
              {!favorite && (
                <a href="#reviews" className="mt-1 flex items-center gap-1 font-semibold">
                  <StarSolid size={14} /> {rating(l.rating)}{l.review_count > 0 && <> · <span className="underline">{plural(l.review_count, "review")}</span></>}
                </a>
              )}
            </section>

            {favorite && (
              <a href="#reviews" className="my-8 flex items-center gap-4 rounded-xl border border-line px-6 py-5">
                <span className="flex items-center gap-1 font-semibold leading-tight"><Laurel size={36} /> <span className="text-center text-lg">Guest<br />favourite</span> <Laurel flip size={36} /></span>
                <span className="hidden flex-1 text-sm font-semibold lg:block">One of the most loved homes, according to guests</span>
                <span className="ml-auto text-center"><span className="block text-lg font-semibold">{rating(l.rating)}</span><span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <StarSolid key={n} size={9} />)}</span></span>
                <span className="h-10 w-px bg-line" />
                <span className="text-center"><span className="block text-lg font-semibold">{l.review_count}</span><span className="text-xs underline">Reviews</span></span>
              </a>
            )}

            <section className="flex items-center gap-6 border-b border-line py-6">
              <Avatar name={l.host.name} src={l.host.avatar_url} size={40} badge={l.host.is_superhost} />
              <div>
                <h3 className="font-semibold">Hosted by {firstName(l.host.name)}</h3>
                <p className="text-sm text-muted">{l.host.is_superhost ? "Superhost · " : ""}{plural(yearsSince(l.host.created_at), "year")} hosting</p>
              </div>
            </section>

            <section className="space-y-6 border-b border-line py-8">
              {highlights.map((h) => (
                <div key={h.title} className="flex gap-6">
                  <Icon name={h.icon} size={24} strokeWidth={1.5} className="mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold">{h.title}</h3>
                    <p className="text-sm text-muted">{h.body}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="border-b border-line py-8">
              <p className="line-clamp-6 whitespace-pre-line">{l.description}</p>
              <button onClick={() => setDescOpen(true)} className="link-underline mt-4 flex items-center gap-1">
                Show more <Icon name="chevron-right" size={12} strokeWidth={3} />
              </button>
              <Modal open={descOpen} onClose={() => setDescOpen(false)} width="max-w-[780px]">
                <div className="px-6 pb-8 pt-2">
                  <h2 className="mb-6 text-[26px] font-semibold">About this space</h2>
                  <p className="whitespace-pre-line">{l.description}</p>
                </div>
              </Modal>
            </section>

            <Amenities amenities={l.amenities} />

            <section className="py-12">
              <h2 className="text-[22px] font-semibold">
                {nights ? `${plural(nights, "night")} in ${l.city}` : "Select check-in date"}
              </h2>
              <p className="mb-6 text-sm text-muted">
                {nights ? `${fmt.short(sel.checkIn!)} – ${fmt.short(sel.checkOut!)}` : `Add your travel dates for exact pricing${l.min_nights > 1 ? ` · ${l.min_nights}-night minimum` : ""}`}
              </p>
              <DateRangeCalendar checkIn={sel.checkIn} checkOut={sel.checkOut} onChange={sel.setRange} blocked={sel.blocked} minNights={l.min_nights} />
              <div className="mt-4 flex justify-end">
                <button onClick={sel.clearDates} className="link-underline text-sm">Clear dates</button>
              </div>
            </section>
          </div>

          <aside className="hidden md:block">
            <div className="sticky top-8 pt-8">
              <BookingCard listing={l} sel={sel} onReserve={reserve} />
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
                <Icon name="flag" size={14} /> <button onClick={() => toast.show("Thanks — we'll take a look")} className="underline">Report this listing</button>
              </p>
            </div>
          </aside>
        </div>

        <div className="border-t border-line">
          <Reviews reviews={l.reviews} avg={l.rating} count={l.review_count} />
          <LocationMap lat={l.latitude} lng={l.longitude} label={[l.city, l.state, l.country].filter(Boolean).join(", ")} />
          <HostCard host={l.host} stats={l.host_stats} />
          <ThingsToKnow maxGuests={l.max_guests} checkIn={sel.checkIn} />
        </div>
      </main>
      <Footer narrow />

      {/* Mobile reserve bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between border-t border-line bg-surface px-6 py-4 md:hidden">
        <button onClick={() => setMobileDates(true)} className="text-left">
          <span className="block">
            <span className="font-semibold">{sel.quote ? price(sel.quote.total) : price(l.price_per_night)}</span> {sel.quote ? "total" : "night"}
          </span>
          <span className="block text-sm font-semibold underline">{sel.checkIn && sel.checkOut ? fmt.range(sel.checkIn, sel.checkOut) : "Add dates"}</span>
        </button>
        <button onClick={() => (sel.quote ? reserve() : setMobileDates(true))} className="btn-brand px-8">{sel.quote ? "Reserve" : "Check availability"}</button>
      </div>
      <Modal open={mobileDates} onClose={() => setMobileDates(false)} title="Select dates"
        footer={<div className="flex items-center justify-between"><button onClick={sel.clearDates} className="link-underline">Clear dates</button><button onClick={() => setMobileDates(false)} className="btn-dark">Save</button></div>}>
        <div className="p-6">
          <DateRangeCalendar months={1} checkIn={sel.checkIn} checkOut={sel.checkOut} onChange={sel.setRange} blocked={sel.blocked} minNights={l.min_nights} />
          {sel.quoteError && <p className="mt-4 text-sm font-semibold text-rausch-dark">{sel.quoteError}</p>}
        </div>
      </Modal>
    </>
  );
}

function ListingSkeleton() {
  return (
    <>
      <Header variant="detail" />
      <div className="mx-auto max-w-detail px-6 pt-6 lg:px-10">
        <div className="skeleton mb-6 hidden h-8 w-1/2 rounded md:block" />
        <div className="skeleton -mx-6 aspect-[4/3] md:mx-0 md:aspect-auto md:h-[min(560px,46vw)] md:rounded-xl" />
        <div className="mt-8 grid gap-20 md:grid-cols-[1fr_370px]">
          <div className="space-y-3"><div className="skeleton h-6 w-2/3 rounded" /><div className="skeleton h-4 w-1/3 rounded" /></div>
          <div className="skeleton hidden h-80 rounded-xl md:block" />
        </div>
      </div>
    </>
  );
}
