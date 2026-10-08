"use client";

import { useMemo, useState } from "react";
import { addDays, addMonths, firstBlockedAfter, fmt, fromISO, monthGrid, toISO, today } from "@/lib/dates";
import { Icon } from "./Icon";

export interface DateRange {
  checkIn: string | null;
  checkOut: string | null;
}

interface Props extends DateRange {
  onChange: (range: DateRange) => void;
  /** Booked nights (ISO). A stay may not include any of them, but may check out on one. */
  blocked?: Set<string>;
  minNights?: number;
  /** Number of months shown side by side on md+ screens (always 1 on mobile). */
  months?: 1 | 2;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type DayState = { disabled: boolean; booked: boolean; reason?: string };

export function DateRangeCalendar({ checkIn, checkOut, onChange, blocked, minNights = 1, months = 2 }: Props) {
  const todayISO = toISO(today());
  const [view, setView] = useState(() => (checkIn ? new Date(fromISO(checkIn).getFullYear(), fromISO(checkIn).getMonth(), 1) : addMonths(today(), 0)));
  const [hovered, setHovered] = useState<string | null>(null);

  const pickingCheckout = !!checkIn && !checkOut;
  // Latest selectable check-out: the first booked night after check-in (guests leave that morning)
  const maxCheckout = useMemo(
    () => (pickingCheckout && blocked ? firstBlockedAfter(checkIn!, blocked) : null),
    [pickingCheckout, checkIn, blocked],
  );
  const minCheckout = pickingCheckout ? toISO(addDays(fromISO(checkIn!), minNights)) : null;

  function stateOf(iso: string): DayState {
    const booked = !!blocked?.has(iso);
    if (iso < todayISO) return { disabled: true, booked: false };
    if (pickingCheckout && iso > checkIn!) {
      if (maxCheckout && iso > maxCheckout) return { disabled: true, booked, reason: "Unavailable" };
      if (minCheckout && iso < minCheckout) return { disabled: true, booked: false, reason: `${minNights}-night minimum` };
      return { disabled: false, booked: false };
    }
    if (booked) return { disabled: true, booked, reason: "Unavailable" };
    // A check-in is only useful if the minimum stay fits before the next booked night
    const cap = blocked ? firstBlockedAfter(iso, blocked) : null;
    if (cap && cap < toISO(addDays(fromISO(iso), minNights))) {
      return { disabled: true, booked: false, reason: `${minNights}-night minimum` };
    }
    return { disabled: false, booked: false };
  }

  function select(iso: string) {
    if (!checkIn || checkOut || iso <= checkIn) {
      onChange({ checkIn: iso, checkOut: null });
    } else {
      onChange({ checkIn, checkOut: iso });
    }
  }

  // End of the highlighted band: the chosen check-out, or the hovered day while choosing one
  const rangeEnd = checkOut ?? (pickingCheckout && hovered && hovered > checkIn! && !stateOf(hovered).disabled ? hovered : null);
  const canGoBack = view > addMonths(today(), 0);

  return (
    <div className="select-none">
      <div className="relative flex gap-12">
        <button
          type="button"
          onClick={() => setView((v) => addMonths(v, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full hover:bg-soft disabled:opacity-20 disabled:hover:bg-transparent"
        >
          <Icon name="chevron-left" size={14} strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={() => setView((v) => addMonths(v, 1))}
          aria-label="Next month"
          className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full hover:bg-soft"
        >
          <Icon name="chevron-right" size={14} strokeWidth={3} />
        </button>

        {Array.from({ length: months }, (_, i) => addMonths(view, i)).map((month, i) => (
          <div key={toISO(month)} className={`flex-1 ${i > 0 ? "hidden md:block" : ""}`}>
            <h3 className="mb-4 text-center text-base font-semibold leading-8">{fmt.monthYear(month)}</h3>
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted">
              {WEEKDAYS.map((d) => <div key={d} className="pb-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7" onMouseLeave={() => setHovered(null)}>
              {monthGrid(month).map((date, idx) => {
                if (!date) return <div key={`pad-${idx}`} className="aspect-square" />;
                const iso = toISO(date);
                const st = stateOf(iso);
                const isStart = iso === checkIn;
                const isEnd = iso === checkOut;
                const inRange = !!checkIn && !!rangeEnd && iso > checkIn && iso < rangeEnd;
                const bandStart = isStart && !!rangeEnd;
                const bandEnd = !!checkIn && iso === rangeEnd;
                return (
                  <div
                    key={iso}
                    className={`relative aspect-square py-px ${inRange ? "bg-soft" : ""} ${
                      bandStart ? "rounded-l-full bg-soft" : ""
                    } ${bandEnd ? "rounded-r-full bg-soft" : ""}`}
                  >
                    <button
                      type="button"
                      disabled={st.disabled}
                      title={st.reason}
                      onClick={() => select(iso)}
                      onMouseEnter={() => setHovered(iso)}
                      aria-label={`${fmt.long(iso)}${st.reason ? ` (${st.reason})` : ""}`}
                      aria-pressed={isStart || isEnd}
                      className={`flex h-full w-full items-center justify-center rounded-full text-sm font-semibold transition ${
                        isStart || isEnd
                          ? "bg-ink text-surface"
                          : st.disabled
                            ? `cursor-not-allowed text-muted/40 ${st.booked ? "line-through" : ""}`
                            : "hover:ring-1 hover:ring-ink"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
