/**
 * Date helpers working on local calendar days. Dates travel as "YYYY-MM-DD" strings; we never go through
 * UTC (new Date("2026-10-12") would parse as UTC midnight and shift a day in some timezones).
 */
import type { BookedRange } from "./types";

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isISODate(s: string | null | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((fromISO(checkOut).getTime() - fromISO(checkIn).getTime()) / 86_400_000);
}

/** Every night (as ISO string) that is already taken. A stay [in, out) occupies in … out-1. */
export function bookedNights(ranges: BookedRange[]): Set<string> {
  const nights = new Set<string>();
  for (const r of ranges) {
    for (let d = fromISO(r.check_in); toISO(d) < r.check_out; d = addDays(d, 1)) nights.add(toISO(d));
  }
  return nights;
}

/** First booked night on/after `from`, used to cap how far a check-out can be picked. */
export function firstBlockedAfter(from: string, blocked: Set<string>): string | null {
  let first: string | null = null;
  blocked.forEach((night) => {
    if (night >= from && (first === null || night < first)) first = night;
  });
  return first;
}

/** True if any night in [checkIn, checkOut) is blocked. */
export function rangeHasConflict(checkIn: string, checkOut: string, blocked: Set<string>): boolean {
  for (let d = fromISO(checkIn); toISO(d) < checkOut; d = addDays(d, 1)) if (blocked.has(toISO(d))) return true;
  return false;
}

const short = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const long = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const monthYear = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const numeric = new Intl.DateTimeFormat("en-US", { month: "numeric", day: "numeric", year: "numeric" });

export const fmt = {
  short: (s: string) => short.format(fromISO(s)),
  long: (s: string) => long.format(fromISO(s)),
  numeric: (s: string) => numeric.format(fromISO(s)),
  monthYear: (d: Date | string) => monthYear.format(typeof d === "string" ? new Date(d) : d),
  /** "Oct 12 – 15" or "Oct 30 – Nov 2" like Airbnb's cards. */
  range: (checkIn: string, checkOut: string) => {
    const a = fromISO(checkIn);
    const b = fromISO(checkOut);
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
      return `${short.format(a)} – ${b.getDate()}`;
    }
    return `${short.format(a)} – ${short.format(b)}`;
  },
};

/** 6x7 grid of dates (null = padding) for a month view, weeks starting on Sunday. */
export function monthGrid(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array(first.getDay()).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/** Friday → Sunday of the coming weekend (next week's if it's already Friday or later). */
export function upcomingWeekend(): { checkIn: string; checkOut: string } {
  const t = today();
  const friday = addDays(t, (5 - t.getDay() + 7) % 7 || 7); // Fri → +7, Sat → +6, Sun → +5 …
  return { checkIn: toISO(friday), checkOut: toISO(addDays(friday, 2)) };
}

export function yearsSince(iso: string): number {
  const years = new Date().getFullYear() - new Date(iso).getFullYear();
  return Math.max(1, years);
}
