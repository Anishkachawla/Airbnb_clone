"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MinimalHeader } from "@/components/layout/MinimalHeader";
import { PriceBreakdown } from "@/components/listing/PriceBreakdown";
import { GuestCounters } from "@/components/search/GuestCounters";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { Icon, StarSolid } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Modal } from "@/components/ui/Modal";
import { RequireUser } from "@/components/ui/RequireUser";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { addDays, bookedNights, fmt, fromISO, isISODate, toISO } from "@/lib/dates";
import { capitalize, plural, rating } from "@/lib/format";
import { guestLabel, guestTotal, type GuestCounts } from "@/lib/searchParams";
import type { BookedRange, ListingDetail, Quote } from "@/lib/types";

export function CheckoutPage() {
  return (
    <>
      <MinimalHeader />
      <RequireUser title="Log in to book" body="You need to be logged in to confirm a reservation.">
        {() => <Checkout />}
      </RequireUser>
    </>
  );
}

function Checkout() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [ranges, setRanges] = useState<BookedRange[]>([]);
  const [dates, setDates] = useState({
    checkIn: isISODate(sp.get("checkIn")) ? sp.get("checkIn") : null,
    checkOut: isISODate(sp.get("checkOut")) ? sp.get("checkOut") : null,
  });
  const [guests, setGuests] = useState<GuestCounts>({
    adults: Math.max(1, Number(sp.get("adults")) || 1),
    children: Number(sp.get("children")) || 0,
    infants: Number(sp.get("infants")) || 0,
    pets: Number(sp.get("pets")) || 0,
  });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [editing, setEditing] = useState<"dates" | "guests" | null>(null);
  const [draftDates, setDraftDates] = useState(dates);
  const [draftGuests, setDraftGuests] = useState(guests);
  const [submitting, setSubmitting] = useState(false);
  const blocked = useMemo(() => bookedNights(ranges), [ranges]);

  useEffect(() => {
    Promise.all([api.listings.get(Number(id)), api.listings.availability(Number(id))])
      .then(([l, r]) => {
        setListing(l);
        setRanges(r);
      })
      .catch((e: Error) => toast.error(e.message));
  }, [id, toast]);

  const total = guestTotal(guests);
  useEffect(() => {
    setQuote(null);
    setQuoteError(null);
    if (!dates.checkIn || !dates.checkOut) {
      setQuoteError("Choose your dates to see the total");
      return;
    }
    api.listings.quote(Number(id), dates.checkIn, dates.checkOut, total).then(setQuote).catch((e: Error) => setQuoteError(e.message));
  }, [id, dates, total]);

  async function confirm() {
    if (!dates.checkIn || !dates.checkOut) return;
    setSubmitting(true);
    try {
      // Simulated payment processing delay
      await new Promise((r) => setTimeout(r, 900));
      const booking = await api.bookings.create({ listing_id: Number(id), check_in: dates.checkIn, check_out: dates.checkOut, guests: total });
      router.push(`/trips/${booking.id}?confirmed=1`);
    } catch (e) {
      toast.error((e as Error).message);
      // Someone may have taken these dates meanwhile: refresh the calendar
      api.listings.availability(Number(id)).then(setRanges).catch(() => {});
      setSubmitting(false);
    }
  }

  if (!listing) return <div className="flex justify-center py-32"><Spinner /></div>;

  const editRow = (label: string, value: string, onEdit: () => void) => (
    <div className="flex items-start justify-between py-3">
      <div><h3 className="font-semibold">{label}</h3><p>{value}</p></div>
      <button onClick={onEdit} className="link-underline">Edit</button>
    </div>
  );

  const cancelBy = dates.checkIn ? fmt.short(toISO(addDays(fromISO(dates.checkIn), -7))) : null;

  return (
    <main className="mx-auto max-w-detail px-6 pb-24 pt-8 md:pt-16 lg:px-10">
      <div className="mb-8 flex items-center gap-4 md:-ml-14">
        <button onClick={() => router.back()} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-soft">
          <Icon name="chevron-left" size={16} strokeWidth={3} />
        </button>
        <h1 className="text-[26px] font-semibold md:text-[32px]">Confirm and pay</h1>
      </div>

      <div className="grid gap-16 md:grid-cols-[1fr_minmax(0,440px)] lg:gap-24">
        <div className="order-2 md:order-1">
          <section className="border-b border-line pb-6">
            <h2 className="mb-3 text-[22px] font-semibold">Your trip</h2>
            {editRow("Dates", dates.checkIn && dates.checkOut ? `${fmt.short(dates.checkIn)} – ${fmt.short(dates.checkOut)}` : "Add dates", () => {
              setDraftDates(dates);
              setEditing("dates");
            })}
            {editRow("Guests", guestLabel(guests), () => {
              setDraftGuests(guests);
              setEditing("guests");
            })}
          </section>

          <section className="border-b border-line py-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[22px] font-semibold">Pay with</h2>
              <span className="flex gap-1 text-2xs font-bold">
                {["VISA", "MC", "AMEX", "UPI"].map((b) => <span key={b} className="rounded border border-line px-1.5 py-0.5">{b}</span>)}
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-muted/60">
              <input aria-label="Card number" defaultValue="4242 4242 4242 4242" readOnly tabIndex={-1} className="w-full border-b border-muted/60 bg-transparent px-3 py-3.5 outline-none" />
              <div className="grid grid-cols-2">
                <input aria-label="Expiration" defaultValue="12 / 29" readOnly tabIndex={-1} className="border-r border-muted/60 bg-transparent px-3 py-3.5 outline-none" />
                <input aria-label="CVV" defaultValue="123" readOnly tabIndex={-1} className="bg-transparent px-3 py-3.5 outline-none" />
              </div>
            </div>
            <p className="mt-3 flex items-center gap-2 rounded-lg bg-soft p-3 text-sm">
              <Icon name="shield" size={16} className="shrink-0" /> Demo checkout: these are test card details and can’t be changed. No payment is taken.
            </p>
          </section>

          <section className="border-b border-line py-8">
            <h2 className="mb-3 text-[22px] font-semibold">Cancellation policy</h2>
            <p><span className="font-semibold">Free cancellation before {cancelBy ?? "7 days before check-in"}.</span> Cancel before check-in for a partial refund.</p>
          </section>

          <section className="border-b border-line py-8">
            <h2 className="mb-3 text-[22px] font-semibold">Ground rules</h2>
            <p className="mb-3">We ask every guest to remember a few simple things about what makes a great guest.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Follow the house rules</li>
              <li>Treat your Host&apos;s home like your own</li>
            </ul>
          </section>

          <p className="py-8 text-xs text-muted">
            By selecting the button below, I agree to the Host&apos;s House Rules, Ground rules for guests, and the Rebooking and Refund Policy.
          </p>
          <button onClick={confirm} disabled={!quote || submitting} className="btn-brand w-full md:w-auto md:min-w-[240px]">
            {submitting ? <Spinner /> : "Confirm and pay"}
          </button>
        </div>

        <aside className="order-1 md:order-2">
          <div className="sticky top-8 rounded-xl border border-line p-6">
            <Link href={`/rooms/${listing.id}`} className="flex gap-4 border-b border-line pb-6">
              <Img src={listing.images[0]?.url ?? ""} alt={listing.title} className="h-[106px] w-[124px] shrink-0 rounded-lg object-cover" />
              <div className="flex min-w-0 flex-col justify-between">
                <div>
                  <p className="text-xs text-muted">{capitalize(listing.property_type)} in {listing.city}</p>
                  <p className="line-clamp-2 text-sm">{listing.title}</p>
                </div>
                <p className="flex items-center gap-1 text-xs"><StarSolid size={10} /> <span className="font-semibold">{rating(listing.rating)}</span> ({plural(listing.review_count, "review")}){listing.host.is_superhost && " · Superhost"}</p>
              </div>
            </Link>
            <h2 className="my-6 text-[22px] font-semibold">Price details</h2>
            {quote ? <PriceBreakdown quote={quote} totalLabel="Total (INR)" /> : <p className="font-semibold text-rausch-dark" role="alert">{quoteError ?? <Spinner />}</p>}
          </div>
        </aside>
      </div>

      <Modal
        open={editing === "dates"}
        onClose={() => setEditing(null)}
        title="Edit dates"
        width="max-w-[720px]"
        footer={
          <div className="flex items-center justify-between">
            <button onClick={() => setDraftDates({ checkIn: null, checkOut: null })} className="link-underline">Clear dates</button>
            <button disabled={!draftDates.checkIn || !draftDates.checkOut} onClick={() => { setDates(draftDates); setEditing(null); }} className="btn-dark">Save</button>
          </div>
        }
      >
        <div className="p-6">
          <DateRangeCalendar checkIn={draftDates.checkIn} checkOut={draftDates.checkOut} onChange={setDraftDates} blocked={blocked} minNights={listing.min_nights} />
        </div>
      </Modal>
      <Modal
        open={editing === "guests"}
        onClose={() => setEditing(null)}
        title="Guests"
        width="max-w-[420px]"
        footer={
          <div className="flex justify-end">
            <button disabled={guestTotal(draftGuests) < 1} onClick={() => { setGuests(draftGuests); setEditing(null); }} className="btn-dark">Save</button>
          </div>
        }
      >
        <div className="px-6 pb-4">
          <GuestCounters value={draftGuests} onChange={setDraftGuests} maxGuests={listing.max_guests} minAdults={1} />
          <p className="text-sm text-muted">This place has a maximum of {listing.max_guests} guests, not including infants.</p>
        </div>
      </Modal>
    </main>
  );
}
