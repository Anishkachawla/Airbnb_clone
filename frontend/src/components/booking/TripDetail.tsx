"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Modal } from "@/components/ui/Modal";
import { RequireUser } from "@/components/ui/RequireUser";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { fmt, toISO, today } from "@/lib/dates";
import { capitalize, firstName, plural, price } from "@/lib/format";
import type { Booking } from "@/lib/types";

export function TripDetail() {
  return (
    <>
      <Header variant="detail" />
      <RequireUser title="Your reservation" body="Log in to see this reservation.">{() => <Trip />}</RequireUser>
    </>
  );
}

function Trip() {
  const { id } = useParams<{ id: string }>();
  const confirmed = useSearchParams().get("confirmed") === "1";
  const toast = useToast();
  const [b, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.bookings.get(Number(id)).then(setBooking).catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <p className="mx-auto max-w-detail px-6 py-16 lg:px-10">{error}</p>;
  if (!b) return <div className="flex justify-center py-32"><Spinner /></div>;

  const upcoming = b.status === "confirmed" && b.check_in > toISO(today());
  const code = `HM${String(b.id).padStart(6, "0")}${b.listing.id}`;

  async function cancel() {
    setCancelling(true);
    try {
      setBooking(await api.bookings.cancel(b!.id));
      toast.show("Your reservation was cancelled");
      setConfirmCancel(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <main className="mx-auto max-w-detail px-6 pb-24 pt-10 lg:px-10">
      {confirmed && b.status === "confirmed" && (
        <div className="mb-8 flex animate-fade-in items-center gap-4 rounded-xl bg-[#008A05]/10 p-5 text-[#006C04] dark:text-[#5BD15E]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#008A05] text-white"><Icon name="check" size={20} strokeWidth={3} /></span>
          <div>
            <p className="font-semibold">Your reservation is confirmed</p>
            <p className="text-sm">You&apos;re going to {b.listing.city}! These dates are now blocked on the listing.</p>
          </div>
        </div>
      )}

      <div className="grid gap-12 md:grid-cols-[1fr_380px]">
        <div>
          <Img src={b.listing.cover_image ?? ""} alt={b.listing.title} className="mb-8 aspect-[16/9] w-full rounded-xl object-cover" />
          <h1 className="text-[32px] font-semibold leading-tight">
            {b.status === "cancelled" ? "Cancelled: " : upcoming ? "Your stay in " : "Your trip to "}{b.listing.city}
          </h1>
          <p className="mt-1 text-muted">{capitalize(b.listing.property_type)} · {b.listing.title}</p>

          <div className="mt-8 grid grid-cols-2 border-y border-line py-6">
            <div className="border-r border-line pr-4">
              <p className="font-semibold">Check-in</p>
              <p>{fmt.long(b.check_in)}</p>
              <p className="text-muted">3:00 PM</p>
            </div>
            <div className="pl-6">
              <p className="font-semibold">Checkout</p>
              <p>{fmt.long(b.check_out)}</p>
              <p className="text-muted">11:00 AM</p>
            </div>
          </div>

          <section className="border-b border-line py-6">
            <h2 className="mb-4 text-[22px] font-semibold">Reservation details</h2>
            <dl className="space-y-4">
              <div><dt className="font-semibold">Who&apos;s coming</dt><dd className="text-muted">{plural(b.guests, "guest")}</dd></div>
              <div><dt className="font-semibold">Confirmation code</dt><dd className="font-mono text-muted">{code}</dd></div>
              <div><dt className="font-semibold">Status</dt><dd className="text-muted">{capitalize(b.status)}</dd></div>
            </dl>
          </section>

          <section className="flex items-center gap-4 border-b border-line py-6">
            <Avatar name={b.listing.host.name} src={b.listing.host.avatar_url} size={56} badge={b.listing.host.is_superhost} />
            <div className="flex-1">
              <p className="font-semibold">Your host, {firstName(b.listing.host.name)}</p>
              <p className="text-sm text-muted">{b.listing.host.is_superhost ? "Superhost" : "Host"}</p>
            </div>
            <button onClick={() => toast.show("Messaging hosts is coming soon")} className="btn-outline text-sm">Message host</button>
          </section>

          <div className="flex flex-wrap gap-3 py-6">
            <Link href={`/rooms/${b.listing.id}`} className="btn-outline">View listing</Link>
            <Link href="/trips" className="btn-outline">All trips</Link>
            {upcoming && <button onClick={() => setConfirmCancel(true)} className="rounded-lg px-5 py-3 font-semibold text-rausch-dark underline hover:bg-soft">Cancel reservation</button>}
          </div>
        </div>

        <aside>
          <div className="sticky top-8 rounded-xl border border-line p-6">
            <h2 className="mb-6 text-[22px] font-semibold">Payment info</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span>{price(b.nightly_rate)} x {plural(b.nights, "night")}</span><span>{price(b.nightly_rate * b.nights)}</span></div>
              {b.cleaning_fee > 0 && <div className="flex justify-between"><span>Cleaning fee</span><span>{price(b.cleaning_fee)}</span></div>}
              <div className="flex justify-between"><span>Service fee</span><span>{price(b.service_fee)}</span></div>
              <hr className="!my-5 border-line" />
              <div className="flex justify-between font-semibold"><span>Total {b.status === "cancelled" ? "(refunded)" : "paid"} (INR)</span><span>{price(b.total_price)}</span></div>
            </div>
            <p className="mt-4 text-xs text-muted">Booked on {fmt.long(b.created_at.slice(0, 10))}. Payment was simulated.</p>
          </div>
        </aside>
      </div>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel reservation"
        footer={<div className="flex justify-between"><button onClick={() => setConfirmCancel(false)} className="link-underline">Keep reservation</button><button onClick={cancel} disabled={cancelling} className="btn-dark">{cancelling ? <Spinner /> : "Cancel reservation"}</button></div>}>
        <div className="p-6">
          <p className="mb-2 text-lg font-semibold">Are you sure?</p>
          <p className="text-muted">Your stay at {b.listing.title} from {fmt.short(b.check_in)} to {fmt.short(b.check_out)} will be cancelled and the dates released. You&apos;ll get a full refund of {price(b.total_price)}.</p>
        </div>
      </Modal>
    </main>
  );
}
