"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { upcomingWeekend } from "@/lib/dates";
import type { ListingCard as Card } from "@/lib/types";
import { ListingCard, ListingCardSkeleton } from "./ListingCard";

interface Row {
  title: string;
  subtitle: string;
  location: string;
  /** Price the coming weekend (and only show homes free then) instead of the default 2 nights. */
  weekend?: boolean;
}

const ROWS: Row[] = [
  { title: "Popular homes in Goa", subtitle: "Beaches, palms and Portuguese villas", location: "Goa" },
  { title: "Available in Kerala this weekend", subtitle: "Backwaters, tea hills and quiet beaches", location: "Kerala", weekend: true },
  { title: "Stay in Himachal Pradesh", subtitle: "Cabins and cottages in the mountains", location: "Himachal Pradesh" },
  { title: "Popular homes in Rajasthan", subtitle: "Havelis, forts and desert light", location: "Rajasthan" },
  { title: "Available in Maharashtra this weekend", subtitle: "Hill stations and the Konkan coast", location: "Maharashtra", weekend: true },
  { title: "Check out homes in Karnataka", subtitle: "Coffee estates, ruins and forests", location: "Karnataka" },
  { title: "Homes in Japan", subtitle: "Machiya, ski chalets and city flats", location: "Japan" },
  { title: "Popular homes in Italy", subtitle: "Coastal villas and Tuscan farmhouses", location: "Italy" },
  { title: "Stay in the United States", subtitle: "Desert hideaways, lake cabins and city lofts", location: "United States" },
];

// Visible cards per breakpoint: 2 (with a peek) → 3 → 4 → 5 → 6 → 7, matching Airbnb's rows
const COLS =
  "auto-cols-[calc((100%_-_16px)/2.15)] sm:auto-cols-[calc((100%_-_32px)/3)] lg:auto-cols-[calc((100%_-_48px)/4)] l2:auto-cols-[calc((100%_-_64px)/5)] xl:auto-cols-[calc((100%_-_80px)/6)] 2xl:auto-cols-[calc((100%_-_96px)/7)]";

/** The home page: titled horizontal carousels, one per destination. */
export function HomeRows() {
  return (
    <div className="space-y-12 md:space-y-14">
      {ROWS.map((row) => <HomeRow key={row.title} row={row} />)}
    </div>
  );
}

function HomeRow({ row }: { row: Row }) {
  const [items, setItems] = useState<Card[] | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const dates = row.weekend ? upcomingWeekend() : null;

  useEffect(() => {
    let alive = true;
    api.listings
      .search({ location: row.location, check_in: dates?.checkIn, check_out: dates?.checkOut }, 1, 12)
      .then((r) => alive && setItems(r.items))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
    // dates are derived from the row and today; recomputing per render would refetch forever
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.location, row.weekend]);

  const updateEdges = () => {
    const el = scroller.current;
    if (el) setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(() => {
    updateEdges();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (items && items.length === 0) return null;

  const q = new URLSearchParams({ location: row.location, ...(dates ?? {}) });
  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth, behavior: "smooth" });
  const arrow =
    "flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface transition hover:shadow-pill disabled:cursor-default disabled:opacity-30 disabled:hover:shadow-none";

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <Link href={`/?${q}`} className="group inline-flex items-center gap-3">
            <h2 className="text-[22px] font-semibold leading-tight md:text-[26px]">{row.title}</h2>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soft transition group-hover:bg-hover">
              <Icon name="chevron-right" size={14} strokeWidth={3} />
            </span>
          </Link>
          <p className="mt-1 text-muted">{row.subtitle}</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <button onClick={() => scroll(-1)} disabled={edges.start} aria-label={`Previous homes in ${row.location}`} className={arrow}>
            <Icon name="chevron-left" size={12} strokeWidth={3.5} />
          </button>
          <button onClick={() => scroll(1)} disabled={edges.end} aria-label={`More homes in ${row.location}`} className={arrow}>
            <Icon name="chevron-right" size={12} strokeWidth={3.5} />
          </button>
        </div>
      </div>
      <div ref={scroller} onScroll={updateEdges} className={`no-scrollbar grid snap-x snap-mandatory grid-flow-col gap-4 overflow-x-auto ${COLS}`}>
        {items
          ? items.map((l) => (
              <div key={l.id} className="snap-start">
                <ListingCard listing={l} variant="row" checkIn={dates?.checkIn} checkOut={dates?.checkOut} />
              </div>
            ))
          : Array.from({ length: 7 }, (_, i) => <ListingCardSkeleton key={i} />)}
      </div>
    </section>
  );
}

/** Floating reminder that card prices already include cleaning and service fees. */
export function PricesPill() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center md:bottom-8">
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-surface px-6 py-4 text-base font-semibold shadow-float ring-1 ring-line">
        <svg viewBox="0 0 32 32" width={30} height={30} aria-hidden="true">
          <path d="M4 15.5V6a2 2 0 0 1 2-2h9.5a2 2 0 0 1 1.4.6l11 11a2 2 0 0 1 0 2.8l-9.5 9.5a2 2 0 0 1-2.8 0l-11-11A2 2 0 0 1 4 15.5z" fill="#FF385C" transform="rotate(-12 16 16)" />
          <circle cx="10" cy="10" r="2.2" fill="#fff" />
        </svg>
        Prices include all fees
      </div>
    </div>
  );
}
