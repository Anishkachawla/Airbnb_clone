"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { bookedNights, isISODate, nightsBetween, rangeHasConflict } from "@/lib/dates";
import { guestTotal, type GuestCounts } from "@/lib/searchParams";
import type { BookedRange, Quote } from "@/lib/types";

/**
 * Date/guest selection for one listing, mirrored into the URL (?checkIn=&checkOut=&adults=…) so the
 * selection survives refresh and carries over from the explore page. Fetches the server-side quote.
 */
export function useBookingSelection(listingId: number, ranges: BookedRange[], minNights: number) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const blocked = useMemo(() => bookedNights(ranges), [ranges]);

  const [checkIn, setCheckIn] = useState<string | null>(() => (isISODate(sp.get("checkIn")) ? sp.get("checkIn") : null));
  const [checkOut, setCheckOut] = useState<string | null>(() => (isISODate(sp.get("checkOut")) ? sp.get("checkOut") : null));
  const [guests, setGuests] = useState<GuestCounts>(() => ({
    adults: Math.max(1, Number(sp.get("adults")) || 1),
    children: Number(sp.get("children")) || 0,
    infants: Number(sp.get("infants")) || 0,
    pets: Number(sp.get("pets")) || 0,
  }));
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);

  // Dates that arrived via the URL may be stale (since booked) — validate them client-side first
  const localError = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    if (checkOut <= checkIn) return "Check-out must be after check-in";
    if (rangeHasConflict(checkIn, checkOut, blocked)) return "Those dates are not available";
    if (nightsBetween(checkIn, checkOut) < minNights) return `This place has a ${minNights}-night minimum`;
    return null;
  }, [checkIn, checkOut, blocked, minNights]);

  useEffect(() => {
    const q = new URLSearchParams();
    if (checkIn) q.set("checkIn", checkIn);
    if (checkOut) q.set("checkOut", checkOut);
    (Object.keys(guests) as (keyof GuestCounts)[]).forEach((k) => guests[k] && q.set(k, String(guests[k])));
    const next = `${pathname}?${q.toString()}`;
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", next);
  }, [checkIn, checkOut, guests, pathname]);

  const total = guestTotal(guests);
  useEffect(() => {
    setQuote(null);
    setQuoteError(localError);
    setQuoting(false);
    if (!checkIn || !checkOut || localError) return;
    let cancelled = false;
    setQuoting(true);
    api.listings
      .quote(listingId, checkIn, checkOut, total)
      .then((q) => !cancelled && setQuote(q))
      .catch((e: ApiError) => !cancelled && setQuoteError(e.message))
      .finally(() => !cancelled && setQuoting(false));
    return () => {
      cancelled = true;
    };
  }, [listingId, checkIn, checkOut, total, localError]);

  return {
    checkIn, checkOut, guests, blocked, quote, quoteError, quoting,
    setRange: (r: { checkIn: string | null; checkOut: string | null }) => {
      setCheckIn(r.checkIn);
      setCheckOut(r.checkOut);
    },
    setGuests,
    clearDates: () => {
      setCheckIn(null);
      setCheckOut(null);
    },
  };
}

export type BookingSelection = ReturnType<typeof useBookingSelection>;
