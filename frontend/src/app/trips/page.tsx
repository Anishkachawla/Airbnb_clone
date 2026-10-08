"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ReviewModal } from "@/components/booking/ReviewModal";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { RequireUser } from "@/components/ui/RequireUser";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { fmt, toISO, today } from "@/lib/dates";
import { capitalize, firstName } from "@/lib/format";
import type { Booking } from "@/lib/types";

export default function TripsPage() {
  return (
    <>
      <Header variant="detail" />
      <RequireUser title="Trips" body="Log in to see your upcoming and past stays.">
        {() => <Trips />}
      </RequireUser>
      <Footer narrow />
    </>
  );
}

function Trips() {
  const [trips, setTrips] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<Booking | null>(null);

  useEffect(() => {
    api.bookings.mine().then(setTrips).catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="mx-auto max-w-detail px-6 py-16 text-rausch-dark lg:px-10">{error}</p>;
  if (!trips) return <div className="flex justify-center py-32"><Spinner /></div>;

  const t = toISO(today());
  const upcoming = trips.filter((b) => b.status === "confirmed" && b.check_out > t).sort((a, b) => a.check_in.localeCompare(b.check_in));
  const past = trips.filter((b) => b.status === "confirmed" && b.check_out <= t);
  const cancelled = trips.filter((b) => b.status === "cancelled");

  return (
    <main className="mx-auto max-w-detail px-6 pb-16 pt-10 lg:px-10">
      <h1 className="mb-8 text-[32px] font-semibold">Trips</h1>

      {upcoming.length === 0 ? (
        <section className="mb-12 border-y border-line py-10">
          <Icon name="home" size={48} strokeWidth={1.4} className="mb-4" />
          <h2 className="text-[22px] font-semibold">No trips booked...yet!</h2>
          <p className="mb-6 mt-2 text-muted">Time to dust off your bags and start planning your next adventure.</p>
          <Link href="/" className="btn-outline inline-block">Start searching</Link>
        </section>
      ) : (
        <section className="mb-12">
          <h2 className="mb-6 text-[22px] font-semibold">Upcoming reservations</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {upcoming.map((b) => (
              <Link key={b.id} href={`/trips/${b.id}`} className="flex overflow-hidden rounded-xl shadow-card transition hover:shadow-float">
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="text-[22px] font-semibold">{b.listing.city}</p>
                    <p className="text-sm text-muted">{capitalize(b.listing.property_type)} hosted by {firstName(b.listing.host.name)}</p>
                  </div>
                  <div className="mt-6 flex gap-4 border-t border-line pt-4 text-sm">
                    <span className="font-semibold">{fmt.range(b.check_in, b.check_out)}<br /><span className="font-normal text-muted">{b.check_in.slice(0, 4)}</span></span>
                    <span className="border-l border-line pl-4">{b.listing.city}<br /><span className="text-muted">{b.listing.country}</span></span>
                  </div>
                </div>
                <Img src={b.listing.cover_image ?? ""} alt="" className="w-2/5 object-cover" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-[22px] font-semibold">Where you&apos;ve been</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((b) => (
              <div key={b.id} className="flex items-center gap-4">
                <Link href={`/rooms/${b.listing.id}`} className="shrink-0">
                  <Img src={b.listing.cover_image ?? ""} alt="" className="h-16 w-16 rounded-lg object-cover" />
                </Link>
                <div className="min-w-0">
                  <Link href={`/rooms/${b.listing.id}`} className="block truncate font-semibold">{b.listing.city}</Link>
                  <p className="truncate text-sm text-muted">Hosted by {firstName(b.listing.host.name)}</p>
                  <p className="text-sm text-muted">{fmt.range(b.check_in, b.check_out)}, {b.check_out.slice(0, 4)}</p>
                  {b.has_review ? (
                    <span className="text-xs font-semibold text-muted">Reviewed</span>
                  ) : (
                    <button onClick={() => setReviewing(b)} className="text-sm font-semibold underline">Leave a review</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {cancelled.length > 0 && (
        <section>
          <h2 className="mb-6 text-[22px] font-semibold">Cancelled</h2>
          <ul className="divide-y divide-line">
            {cancelled.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-4 text-sm">
                <Link href={`/rooms/${b.listing.id}`} className="font-semibold hover:underline">{b.listing.title}</Link>
                <span className="text-muted">{fmt.range(b.check_in, b.check_out)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ReviewModal
        booking={reviewing}
        onClose={() => setReviewing(null)}
        onDone={(id) => {
          setTrips((ts) => ts?.map((b) => (b.id === id ? { ...b, has_review: true } : b)) ?? null);
          setReviewing(null);
        }}
      />
    </main>
  );
}
