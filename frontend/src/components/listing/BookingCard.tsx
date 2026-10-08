"use client";

import { useRef, useState } from "react";
import { GuestCounters } from "@/components/search/GuestCounters";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { fmt, nightsBetween } from "@/lib/dates";
import { price } from "@/lib/format";
import { useClickOutside } from "@/lib/hooks";
import { guestLabel } from "@/lib/searchParams";
import type { ListingDetail } from "@/lib/types";
import { PriceBreakdown } from "./PriceBreakdown";
import type { BookingSelection } from "./useBookingSelection";

interface Props {
  listing: ListingDetail;
  sel: BookingSelection;
  onReserve: () => void;
}

/** The sticky reservation card on the right of the listing page. */
export function BookingCard({ listing, sel, onReserve }: Props) {
  const [panel, setPanel] = useState<"dates" | "guests" | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useClickOutside(root, () => setPanel(null), panel !== null);

  const hasDates = !!sel.checkIn && !!sel.checkOut;
  const canReserve = hasDates && !!sel.quote && !sel.quoteError;

  return (
    <div ref={root} className="relative rounded-xl border border-line p-6 shadow-card">
      <div className="mb-6 flex items-baseline gap-1">
        {sel.quote ? (
          <>
            <span className="text-[22px] font-semibold underline">{price(sel.quote.total)}</span>
            <span>for {sel.quote.nights} night{sel.quote.nights > 1 ? "s" : ""}</span>
          </>
        ) : (
          <>
            <span className="text-[22px] font-semibold">{price(listing.price_per_night)}</span>
            <span>night</span>
          </>
        )}
      </div>

      <div className="rounded-lg border border-muted/60">
        <button type="button" onClick={() => setPanel(panel === "dates" ? null : "dates")} className="grid w-full grid-cols-2 text-left">
          <span className={`rounded-tl-lg border-r border-muted/60 px-3 py-2.5 ${panel === "dates" ? "ring-2 ring-ink" : ""}`}>
            <span className="block text-2xs font-bold uppercase">Check-in</span>
            <span className={`block text-sm ${sel.checkIn ? "" : "text-muted"}`}>{sel.checkIn ? fmt.numeric(sel.checkIn) : "Add date"}</span>
          </span>
          <span className="rounded-tr-lg px-3 py-2.5">
            <span className="block text-2xs font-bold uppercase">Checkout</span>
            <span className={`block text-sm ${sel.checkOut ? "" : "text-muted"}`}>{sel.checkOut ? fmt.numeric(sel.checkOut) : "Add date"}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setPanel(panel === "guests" ? null : "guests")}
          className={`flex w-full items-center justify-between border-t border-muted/60 px-3 py-2.5 text-left ${panel === "guests" ? "rounded-b-lg ring-2 ring-ink" : ""}`}
        >
          <span>
            <span className="block text-2xs font-bold uppercase">Guests</span>
            <span className="block text-sm">{guestLabel(sel.guests)}</span>
          </span>
          <Icon name="chevron-down" size={16} className={`transition ${panel === "guests" ? "rotate-180" : ""}`} />
        </button>
      </div>

      {panel === "guests" && (
        <div className="absolute left-6 right-6 z-20 mt-1 rounded-lg bg-surface px-4 pb-4 shadow-float ring-1 ring-line">
          <GuestCounters value={sel.guests} onChange={sel.setGuests} maxGuests={listing.max_guests} minAdults={1} />
          <p className="text-sm text-muted">This place has a maximum of {listing.max_guests} guests, not including infants.</p>
          <div className="mt-3 flex justify-end">
            <button onClick={() => setPanel(null)} className="link-underline rounded-lg px-3 py-2 hover:bg-soft">Close</button>
          </div>
        </div>
      )}

      {panel === "dates" && (
        <div className="absolute right-[-24px] top-[60px] z-20 w-[min(680px,90vw)] rounded-2xl bg-surface p-6 shadow-float ring-1 ring-line">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-[22px] font-semibold">
                {sel.checkIn && sel.checkOut ? `${nightsBetween(sel.checkIn, sel.checkOut)} nights` : "Select dates"}
              </h3>
              <p className="text-sm text-muted">
                {sel.checkIn && sel.checkOut ? `${fmt.short(sel.checkIn)} – ${fmt.short(sel.checkOut)}` : listing.min_nights > 1 ? `Minimum stay: ${listing.min_nights} nights` : "Add your travel dates for exact pricing"}
              </p>
            </div>
          </div>
          <DateRangeCalendar
            checkIn={sel.checkIn}
            checkOut={sel.checkOut}
            blocked={sel.blocked}
            minNights={listing.min_nights}
            onChange={(r) => {
              sel.setRange(r);
              if (r.checkOut) setPanel(null);
            }}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={sel.clearDates} className="link-underline rounded-lg px-3 py-2 hover:bg-soft">Clear dates</button>
            <button onClick={() => setPanel(null)} className="btn-dark px-4 py-2 text-sm">Close</button>
          </div>
        </div>
      )}

      <button
        onClick={() => (hasDates ? onReserve() : setPanel("dates"))}
        disabled={hasDates && !canReserve}
        className="btn-brand mt-4 w-full"
      >
        {sel.quoting ? <Spinner /> : hasDates ? "Reserve" : "Check availability"}
      </button>

      {sel.quoteError && <p className="mt-3 text-center text-sm font-semibold text-rausch-dark" role="alert">{sel.quoteError}</p>}

      {sel.quote && !sel.quoteError && (
        <>
          <p className="my-4 text-center text-sm text-muted">You won't be charged yet</p>
          <PriceBreakdown quote={sel.quote} />
        </>
      )}
    </div>
  );
}
