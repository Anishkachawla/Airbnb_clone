"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Icon, StarSolid } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Modal } from "@/components/ui/Modal";
import { RequireUser } from "@/components/ui/RequireUser";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { fmt, toISO, today } from "@/lib/dates";
import { capitalize, firstName, location, plural, price, rating } from "@/lib/format";
import type { Booking, ListingCard, User } from "@/lib/types";
import { HostingHeader, type HostTab } from "./HostingHeader";

export function HostDashboard() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: HostTab = sp.get("tab") === "listings" ? "listings" : "today";
  const { user } = useAuth();
  return (
    <>
      <HostingHeader tab={tab} showTabs={!!user?.is_host} onTab={(t) => router.replace(`${pathname}?tab=${t}`)} />
      <RequireUser title="Become a host" body="Log in to start hosting or manage your listings.">
        {(user) => (user.is_host ? <Dashboard tab={tab} user={user} /> : <BecomeHost />)}
      </RequireUser>
    </>
  );
}

function BecomeHost() {
  const { setUser } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <main className="mx-auto grid max-w-detail items-center gap-12 px-6 py-20 md:grid-cols-2 lg:px-10">
      <div>
        <h1 className="mb-4 text-[48px] font-semibold leading-[1.1]">Your home could earn you money</h1>
        <p className="mb-8 text-lg text-muted">Share your space, set your own price and calendar, and welcome guests from around the world.</p>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              setUser(await api.users.becomeHost());
              toast.show("You're a host now. Let's create your first listing");
            } catch (e) {
              toast.error((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
          className="btn-brand"
        >
          {busy ? <Spinner /> : "Start hosting"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {["1600596542815-ffad4c1539a9", "1522708323590-d24dbb6b0267", "1449158743715-0a90ebb6d2d8", "1613490493576-7fde63acd811"].map((p) => (
          <Img key={p} src={`https://images.unsplash.com/photo-${p}?auto=format&fit=crop&w=500&q=60`} alt="" className="aspect-square rounded-2xl object-cover" />
        ))}
      </div>
    </main>
  );
}

type ResFilter = "checkout" | "current" | "arriving" | "upcoming" | "past";

function Dashboard({ tab, user }: { tab: HostTab; user: User }) {
  const toast = useToast();
  const [listings, setListings] = useState<ListingCard[] | null>(null);
  const [reservations, setReservations] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState<ResFilter>("upcoming");
  const [toDelete, setToDelete] = useState<ListingCard | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api.host.listings().then(setListings).catch((e: Error) => toast.error(e.message));
    api.host.reservations().then(setReservations).catch((e: Error) => toast.error(e.message));
  }, [toast]);
  useEffect(load, [load]);

  const t = toISO(today());
  const groups = useMemo(() => {
    const confirmed = (reservations ?? []).filter((r) => r.status === "confirmed");
    const in7 = toISO(new Date(Date.now() + 7 * 86_400_000));
    return {
      checkout: confirmed.filter((r) => r.check_out === t),
      current: confirmed.filter((r) => r.check_in <= t && r.check_out > t),
      arriving: confirmed.filter((r) => r.check_in > t && r.check_in <= in7),
      upcoming: confirmed.filter((r) => r.check_in > t).sort((a, b) => a.check_in.localeCompare(b.check_in)),
      past: (reservations ?? []).filter((r) => r.check_out <= t || r.status === "cancelled"),
    } satisfies Record<ResFilter, Booking[]>;
  }, [reservations, t]);

  const earnings = (reservations ?? []).filter((r) => r.status === "confirmed").reduce((sum, r) => sum + r.total_price - r.service_fee, 0);
  const rated = (listings ?? []).filter((l) => l.rating !== null);
  const avgRating = rated.length ? rated.reduce((s, l) => s + l.rating! * l.review_count, 0) / rated.reduce((s, l) => s + l.review_count, 0) : null;

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.listings.remove(toDelete.id);
      setListings((ls) => ls?.filter((l) => l.id !== toDelete.id) ?? null);
      toast.show("Listing deleted");
      setToDelete(null);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  async function cancelReservation(r: Booking) {
    try {
      const updated = await api.bookings.cancel(r.id);
      setReservations((rs) => rs?.map((x) => (x.id === r.id ? updated : x)) ?? null);
      toast.show(`Reservation for ${firstName(r.guest.name)} cancelled`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const chips: { key: ResFilter; label: string }[] = [
    { key: "checkout", label: "Checking out" },
    { key: "current", label: "Currently hosting" },
    { key: "arriving", label: "Arriving soon" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past & cancelled" },
  ];

  if (!listings || !reservations) return <div className="flex justify-center py-32"><Spinner /></div>;

  return (
    <main className="mx-auto max-w-page px-6 pb-24 pt-10 xl:px-10 2xl:px-20">
      {tab === "today" ? (
        <>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h1 className="text-[32px] font-semibold">Welcome back, {firstName(user.name)}</h1>
            <Link href="/hosting/listings/new" className="btn-outline flex items-center gap-2 text-sm"><Icon name="plus" size={14} strokeWidth={3} /> Create listing</Link>
          </div>

          <div className="mb-12 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Earnings (all time)", value: price(earnings) },
              { label: "Upcoming reservations", value: String(groups.upcoming.length) },
              { label: "Overall rating", value: avgRating ? `${avgRating.toFixed(2)} ★` : "No reviews yet" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-line p-6">
                <p className="text-sm text-muted">{s.label}</p>
                <p className="mt-1 text-[28px] font-semibold">{s.value}</p>
              </div>
            ))}
          </div>

          <h2 className="mb-4 text-[26px] font-semibold">Your reservations</h2>
          <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={() => setFilter(c.key)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${filter === c.key ? "border-2 border-ink bg-soft font-semibold" : "border-line hover:border-ink"}`}
              >
                {c.label} ({groups[c.key].length})
              </button>
            ))}
          </div>

          {groups[filter].length === 0 ? (
            <div className="flex flex-col items-center rounded-xl bg-soft px-6 py-16 text-center">
              <Icon name="calendar" size={32} strokeWidth={1.5} />
              <p className="mt-4 max-w-xs">You don&apos;t have any guests {filter === "past" ? "in your history yet" : filter === "current" ? "staying with you right now" : filter === "checkout" ? "checking out today" : "arriving soon"}.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {groups[filter].map((r) => (
                <article key={r.id} className="flex flex-col rounded-xl border border-line p-5">
                  <div className="flex items-start justify-between">
                    <p className={`text-sm font-semibold ${r.status === "cancelled" ? "text-muted line-through" : "text-rausch-dark"}`}>
                      {r.status === "cancelled" ? "Cancelled" : r.check_in > t ? `Arrives ${fmt.short(r.check_in)}` : r.check_out > t ? `Leaves ${fmt.short(r.check_out)}` : "Completed"}
                    </p>
                    <Avatar name={r.guest.name} src={r.guest.avatar_url} size={40} />
                  </div>
                  <p className="mt-2 text-lg font-semibold">{r.guest.name}</p>
                  <p className="text-sm text-muted">{fmt.range(r.check_in, r.check_out)} · {plural(r.guests, "guest")} · {price(r.total_price)}</p>
                  <p className="mt-1 truncate text-sm">{r.listing.title}</p>
                  {r.status === "confirmed" && r.check_in > t && (
                    <button onClick={() => cancelReservation(r)} className="mt-4 self-start text-sm font-semibold underline">Cancel reservation</button>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-[32px] font-semibold">Your listings</h1>
            <Link href="/hosting/listings/new" aria-label="Create listing" className="flex h-11 w-11 items-center justify-center rounded-full bg-soft hover:bg-hover">
              <Icon name="plus" size={18} strokeWidth={2.5} />
            </Link>
          </div>
          {listings.length === 0 ? (
            <div className="rounded-xl bg-soft p-10">
              <h2 className="text-[22px] font-semibold">You don&apos;t have any listings yet</h2>
              <p className="mb-6 mt-2 text-muted">It only takes a few minutes to set one up.</p>
              <Link href="/hosting/listings/new" className="btn-dark inline-block">Create your first listing</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="border-b border-line text-sm text-muted">
                  <tr><th className="py-3 font-normal">Listing</th><th className="font-normal">Location</th><th className="font-normal">Price</th><th className="font-normal">Rating</th><th className="font-normal">Status</th><th /></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {listings.map((l) => (
                    <tr key={l.id}>
                      <td className="py-4 pr-4">
                        <Link href={`/rooms/${l.id}`} className="flex items-center gap-4 hover:underline">
                          <Img src={l.images[0] ?? ""} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                          <span className="font-semibold">{l.title}</span>
                        </Link>
                      </td>
                      <td className="pr-4 text-sm">{location(l)}</td>
                      <td className="pr-4 text-sm">{price(l.price_per_night)}<span className="text-muted"> /night</span></td>
                      <td className="pr-4 text-sm"><span className="flex items-center gap-1"><StarSolid size={10} />{rating(l.rating)} <span className="text-muted">({l.review_count})</span></span></td>
                      <td className="pr-4 text-sm"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#008A05]" />Listed · {capitalize(l.property_type)}</span></td>
                      <td className="whitespace-nowrap text-right">
                        <Link href={`/hosting/listings/${l.id}/edit`} aria-label={`Edit ${l.title}`} className="inline-flex rounded-full p-2.5 hover:bg-soft"><Icon name="edit" size={16} /></Link>
                        <button onClick={() => setToDelete(l)} aria-label={`Delete ${l.title}`} className="inline-flex rounded-full p-2.5 hover:bg-soft"><Icon name="trash" size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete listing"
        footer={<div className="flex justify-between"><button onClick={() => setToDelete(null)} className="link-underline">Keep it</button><button onClick={confirmDelete} disabled={deleting} className="btn-dark">{deleting ? <Spinner /> : "Delete listing"}</button></div>}>
        <div className="p-6">
          <p className="mb-2 text-lg font-semibold">Delete “{toDelete?.title}”?</p>
          <p className="text-muted">This permanently removes the listing, its photos and its reviews. Listings with upcoming reservations can&apos;t be deleted — cancel those first.</p>
        </div>
      </Modal>
    </main>
  );
}
