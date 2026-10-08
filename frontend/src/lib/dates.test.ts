// Run with: npm test   (node:test via tsx — no extra framework needed)
import assert from "node:assert/strict";
import { test } from "node:test";
import { bookedNights, firstBlockedAfter, fmt, fromISO, nightsBetween, rangeHasConflict, toISO } from "./dates";
import { guestLabel, parseExplore, toApiParams, toQueryString } from "./searchParams";

const blocked = bookedNights([{ check_in: "2026-10-10", check_out: "2026-10-13" }]);

test("a stay occupies check-in through the night before check-out", () => {
  assert.deepEqual([...blocked], ["2026-10-10", "2026-10-11", "2026-10-12"]);
});

test("overlap rules match the backend (half-open ranges)", () => {
  assert.equal(firstBlockedAfter("2026-10-05", blocked), "2026-10-10");
  assert.equal(rangeHasConflict("2026-10-05", "2026-10-10", blocked), false); // leave the morning they arrive
  assert.equal(rangeHasConflict("2026-10-05", "2026-10-11", blocked), true);
  assert.equal(rangeHasConflict("2026-10-13", "2026-10-15", blocked), false); // same-day turnover
});

test("night counting is calendar-based (month ends, DST)", () => {
  assert.equal(nightsBetween("2026-10-30", "2026-11-02"), 3);
  assert.equal(nightsBetween("2026-03-28", "2026-03-30"), 2);
  assert.equal(toISO(fromISO("2026-01-05")), "2026-01-05");
});

test("date ranges format like Airbnb cards", () => {
  assert.equal(fmt.range("2026-10-12", "2026-10-15"), "Oct 12 – 15");
  assert.equal(fmt.range("2026-10-30", "2026-11-02"), "Oct 30 – Nov 2");
});

test("explore state round-trips through the URL", () => {
  const qs = "location=Goa&checkIn=2026-10-12&checkOut=2026-10-15&adults=2&infants=1&types=villa%2Ccabin&amenities=1%2C4";
  const state = parseExplore(new URLSearchParams(qs));
  assert.equal(toQueryString(state), `?${qs}`);
  assert.equal(guestLabel(state.guests), "2 guests, 1 infant");
  assert.equal(toApiParams(state).guests, 2); // infants don't count toward max guests
  assert.equal(parseExplore(new URLSearchParams("checkIn=2026-10-15&checkOut=2026-10-12")).checkIn, null);
});
