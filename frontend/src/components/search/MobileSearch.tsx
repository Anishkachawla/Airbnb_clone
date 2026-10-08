"use client";

import { useState, type ReactNode } from "react";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { fmt } from "@/lib/dates";
import { guestLabel } from "@/lib/searchParams";
import { GuestCounters } from "./GuestCounters";
import { RegionList } from "./RegionList";
import { useSearchDraft } from "./useSearchDraft";

type Step = "where" | "when" | "who";

/** Full-screen stacked search used below the md breakpoint. */
export function MobileSearch({ onOpenFilters }: { onOpenFilters?: () => void }) {
  const search = useSearchDraft();
  const { draft, setDraft, submit, clear, current } = search;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("where");

  const summary = [
    current.checkIn && current.checkOut ? fmt.range(current.checkIn, current.checkOut) : "Any week",
    guestLabel(current.guests),
  ].join(" · ");

  const card = (key: Step, label: string, value: string, body: ReactNode) =>
    step === key ? (
      <section className="rounded-3xl bg-surface p-6 shadow-card">
        <h2 className="mb-4 text-[22px] font-bold">{label}</h2>
        {body}
      </section>
    ) : (
      <button type="button" onClick={() => setStep(key)} className="flex w-full items-center justify-between rounded-2xl bg-surface px-5 py-5 text-sm shadow-pill">
        <span className="text-muted">{label}</span>
        <span className="font-semibold">{value}</span>
      </button>
    );

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            search.reset();
            setOpen(true);
          }}
          className="flex flex-1 items-center gap-4 rounded-full border border-line px-5 py-2.5 text-left shadow-search"
        >
          <Icon name="search" size={18} strokeWidth={2.5} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{current.location || "Where to?"}</span>
            <span className="block truncate text-xs text-muted">{summary}</span>
          </span>
        </button>
        {onOpenFilters && (
          <button onClick={onOpenFilters} aria-label="Filters" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line">
            <Icon name="filters" size={16} />
          </button>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        fullscreen
        title="Stays"
        footer={
          <div className="flex items-center justify-between">
            <button type="button" onClick={clear} className="link-underline">Clear all</button>
            <button
              type="button"
              onClick={() => {
                submit();
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg bg-rausch px-6 py-3 font-semibold text-white"
            >
              <Icon name="search" size={16} strokeWidth={3} /> Search
            </button>
          </div>
        }
      >
        <div className="flex min-h-full flex-col gap-3 bg-soft p-3">
          {card("where", "Where to?", draft.location || "I'm flexible", (
            <>
              <input
                autoFocus
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                placeholder="Search destinations"
                className="field mb-3"
              />
              <div className="-mx-4">
                <RegionList query={draft.location} onPick={(location) => { setDraft({ ...draft, location }); setStep("when"); }} />
              </div>
            </>
          ))}
          {card("when", "When's your trip?", draft.checkIn && draft.checkOut ? fmt.range(draft.checkIn, draft.checkOut) : "Add dates", (
            <DateRangeCalendar
              months={1}
              checkIn={draft.checkIn}
              checkOut={draft.checkOut}
              onChange={(r) => {
                setDraft({ ...draft, ...r });
                if (r.checkOut) setStep("who");
              }}
            />
          ))}
          {card("who", "Who's coming?", guestLabel(draft.guests), (
            <GuestCounters value={draft.guests} onChange={(guests) => setDraft({ ...draft, guests })} />
          ))}
        </div>
      </Modal>
    </>
  );
}
