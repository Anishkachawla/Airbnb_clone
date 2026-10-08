"use client";

import { useRef, useState } from "react";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { Icon } from "@/components/ui/Icon";
import { fmt } from "@/lib/dates";
import { useClickOutside } from "@/lib/hooks";
import { guestLabel } from "@/lib/searchParams";
import { GuestCounters } from "./GuestCounters";
import { RegionList } from "./RegionList";
import type { useSearchDraft } from "./useSearchDraft";

type Segment = "where" | "when" | "who" | null;

/** The large desktop "Where | When | Who" bar with its dropdown panels. */
export function SearchBar({ search, onDone }: { search: ReturnType<typeof useSearchDraft>; onDone?: () => void }) {
  const { draft, setDraft, submit } = search;
  const [active, setActive] = useState<Segment>(null);
  const root = useRef<HTMLFormElement>(null);
  const whereInput = useRef<HTMLInputElement>(null);
  useClickOutside(root, () => setActive(null), active !== null);

  const run = () => {
    setActive(null);
    submit();
    onDone?.();
  };

  const hasDates = !!draft.checkIn && !!draft.checkOut;
  const when = hasDates ? fmt.range(draft.checkIn!, draft.checkOut!) : draft.checkIn ? `${fmt.short(draft.checkIn)} – Add checkout` : "";
  const guests = guestLabel(draft.guests, "");

  const seg = (key: Exclude<Segment, null>) =>
    `flex h-full cursor-pointer flex-col justify-center rounded-full px-8 transition ${
      active === key ? "bg-surface shadow-search" : "hover:bg-hover/70"
    }`;
  // Dividers hide next to the active/hovered segment, as on Airbnb
  const divider = (between: Segment[]) => (
    <span className={`h-8 w-px shrink-0 bg-line transition-opacity ${between.includes(active) ? "opacity-0" : ""}`} />
  );

  return (
    <form
      ref={root}
      onSubmit={(e) => {
        e.preventDefault();
        run();
      }}
      className="relative mx-auto w-full max-w-[880px]"
    >
      <div className={`flex h-[66px] items-center rounded-full border border-line shadow-search transition ${active ? "bg-soft" : "bg-surface"}`}>
        <div
          className={`${seg("where")} w-[34%] cursor-text`}
          onClick={() => {
            setActive("where");
            whereInput.current?.focus();
          }}
        >
          <label htmlFor="where" className="text-xs font-semibold">Where</label>
          <input
            id="where"
            ref={whereInput}
            value={draft.location}
            onFocus={() => setActive("where")}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            placeholder="Search destinations"
            autoComplete="off"
            className="w-full truncate bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        {divider(["where", "when"])}
        <div role="button" tabIndex={0} className={`${seg("when")} w-[30%]`} onClick={() => setActive("when")} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setActive("when"))}>
          <span className="text-xs font-semibold">When</span>
          <span className={`truncate text-sm ${when ? "text-ink" : "text-muted"}`}>{when || "Add dates"}</span>
        </div>
        {divider(["when", "who"])}
        <div className="relative h-full flex-1">
          <div
            role="button"
            tabIndex={0}
            className={`${seg("who")} ${active ? "pr-[136px]" : "pr-[72px]"}`}
            onClick={() => setActive("who")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setActive("who"))}
          >
            <span className="text-xs font-semibold">Who</span>
            <span className={`truncate text-sm ${guests ? "text-ink" : "text-muted"}`}>{guests || "Add guests"}</span>
          </div>
          <button
            type="submit"
            className={`absolute right-2 top-1/2 flex h-12 -translate-y-1/2 items-center justify-center gap-2 rounded-full bg-rausch font-semibold text-white transition-all hover:bg-rausch-dark ${active ? "px-5" : "w-12"}`}
            aria-label="Search"
          >
            <Icon name="search" size={18} strokeWidth={3} />
            {active && <span>Search</span>}
          </button>
        </div>
      </div>

      {active === "where" && (
        <div className="absolute left-0 top-[calc(100%+12px)] z-50 w-[425px] animate-fade-in rounded-[32px] bg-surface py-6 shadow-float">
          <RegionList
            query={draft.location}
            onPick={(location) => {
              setDraft({ ...draft, location });
              setActive("when");
            }}
          />
        </div>
      )}
      {active === "when" && (
        <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 animate-fade-in rounded-[32px] bg-surface px-8 py-8 shadow-float">
          <DateRangeCalendar
            checkIn={draft.checkIn}
            checkOut={draft.checkOut}
            onChange={(r) => {
              setDraft({ ...draft, ...r });
              if (r.checkOut) setActive("who");
            }}
          />
          {(draft.checkIn || draft.checkOut) && (
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setDraft({ ...draft, checkIn: null, checkOut: null })} className="link-underline text-sm">
                Clear dates
              </button>
            </div>
          )}
        </div>
      )}
      {active === "who" && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[400px] animate-fade-in rounded-[32px] bg-surface px-8 py-4 shadow-float">
          <GuestCounters value={draft.guests} onChange={(g) => setDraft({ ...draft, guests: g })} />
        </div>
      )}
    </form>
  );
}
