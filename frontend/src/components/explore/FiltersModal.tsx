"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { PROPERTY_TYPES } from "@/lib/constants";
import { price } from "@/lib/format";
import { useDebounced } from "@/lib/hooks";
import { toApiParams, type ExploreState } from "@/lib/searchParams";
import type { Amenity } from "@/lib/types";

const PRICE_MAX = 100000;
const STEP = 500;

interface Props {
  open: boolean;
  onClose: () => void;
  state: ExploreState;
  onApply: (next: ExploreState) => void;
}

/** Price / rooms / property type / amenities. Footer shows a live result count, like Airbnb. */
export function FiltersModal({ open, onClose, state, onApply }: Props) {
  const [draft, setDraft] = useState(state);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    if (open) setDraft(state);
  }, [open, state]);

  useEffect(() => {
    if (open && !amenities.length) api.meta().then((m) => setAmenities(m.amenities)).catch(() => {});
  }, [open, amenities.length]);

  const debounced = useDebounced(draft, 350);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setCount(null);
    api.listings
      .search(toApiParams(debounced), 1, 1)
      .then((r) => !cancelled && setCount(r.total))
      .catch(() => !cancelled && setCount(-1));
    return () => {
      cancelled = true;
    };
  }, [debounced, open]);

  const min = draft.minPrice ?? 0;
  const max = draft.maxPrice ?? PRICE_MAX;
  const setRange = (lo: number, hi: number) =>
    setDraft({ ...draft, minPrice: lo <= 0 ? null : lo, maxPrice: hi >= PRICE_MAX ? null : hi });

  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const clear = () => setDraft({ ...draft, minPrice: null, maxPrice: null, types: [], bedrooms: 0, amenities: [] });
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 8);

  const section = "border-b border-line px-6 py-8";
  const pct = (v: number) => (v / PRICE_MAX) * 100;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filters"
      width="max-w-[780px]"
      footer={
        <div className="flex items-center justify-between">
          <button onClick={clear} className="link-underline rounded-lg px-2 py-2 hover:bg-soft">Clear all</button>
          <button onClick={() => onApply(draft)} className="btn-dark min-w-[160px]">
            {count === null ? <Spinner /> : count < 0 ? "Show places" : count === 0 ? "No exact matches" : `Show ${count} place${count === 1 ? "" : "s"}`}
          </button>
        </div>
      }
    >
      <section className={section}>
        <h3 className="text-[22px] font-semibold">Price range</h3>
        <p className="mb-8 text-muted">Nightly prices before fees and taxes</p>
        <div className="relative mx-3 h-8">
          <div className="absolute top-1/2 h-0.5 w-full -translate-y-1/2 bg-line" />
          <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-ink" style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }} />
          {/* Two overlaid native range inputs: accessible and keyboard-friendly */}
          <input type="range" aria-label="Minimum price" min={0} max={PRICE_MAX} step={STEP} value={min}
            onChange={(e) => setRange(Math.min(Number(e.target.value), max - STEP), max)}
            className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent" />
          <input type="range" aria-label="Maximum price" min={0} max={PRICE_MAX} step={STEP} value={max}
            onChange={(e) => setRange(min, Math.max(Number(e.target.value), min + STEP))}
            className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent" />
        </div>
        <div className="mt-6 flex items-center gap-4">
          <PriceField label="Minimum" value={min} onCommit={(v) => setRange(Math.min(v, max - STEP), max)} />
          <PriceField label="Maximum" value={max} openEnded onCommit={(v) => setRange(min, Math.max(v, min + STEP))} />
        </div>
      </section>

      <section className={section}>
        <h3 className="mb-6 text-[22px] font-semibold">Rooms and beds</h3>
        <p className="mb-3">Bedrooms</p>
        <div className="flex flex-wrap gap-3">
          {[0, 1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => setDraft({ ...draft, bedrooms: n })}
              className={`rounded-full border px-6 py-2.5 text-sm transition ${draft.bedrooms === n ? "border-ink bg-ink text-surface" : "border-line hover:border-ink"}`}
            >
              {n === 0 ? "Any" : n === 6 ? "6+" : n}
            </button>
          ))}
        </div>
      </section>

      <section className={section}>
        <h3 className="mb-6 text-[22px] font-semibold">Property type</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PROPERTY_TYPES.map((t) => {
            const on = draft.types.includes(t.key);
            return (
              <button
                key={t.key}
                onClick={() => setDraft({ ...draft, types: toggleIn(draft.types, t.key) })}
                aria-pressed={on}
                className={`flex h-[120px] flex-col justify-between rounded-xl border p-4 text-left transition ${on ? "border-2 border-ink bg-soft" : "border-line hover:border-ink"}`}
              >
                <Icon name={t.icon} size={32} strokeWidth={1.4} />
                <span className="font-semibold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-8">
        <h3 className="mb-6 text-[22px] font-semibold">Amenities</h3>
        <div className="grid gap-x-6 sm:grid-cols-2">
          {visibleAmenities.map((a) => (
            <label key={a.id} className="flex cursor-pointer items-center justify-between py-3">
              <span>{a.name}</span>
              <input
                type="checkbox"
                checked={draft.amenities.includes(a.id)}
                onChange={() => setDraft({ ...draft, amenities: toggleIn(draft.amenities, a.id) })}
                className="h-6 w-6 cursor-pointer rounded accent-[#222]"
              />
            </label>
          ))}
        </div>
        {amenities.length > 8 && (
          <button onClick={() => setShowAllAmenities((s) => !s)} className="link-underline mt-4">
            {showAllAmenities ? "Show less" : "Show more"}
          </button>
        )}
      </section>
    </Modal>
  );
}

/** Free typing; the value is only clamped when the field is committed (blur or Enter). */
function PriceField({ label, value, onCommit, openEnded }: { label: string; value: number; onCommit: (v: number) => void; openEnded?: boolean }) {
  const shown = openEnded && value >= PRICE_MAX ? "" : String(value);
  const [text, setText] = useState(shown);
  useEffect(() => setText(shown), [shown]); // follow the slider

  const commit = () => {
    const digits = text.replace(/\D/g, "");
    if (!digits) onCommit(openEnded ? PRICE_MAX : 0);
    else onCommit(Math.min(Number(digits), PRICE_MAX));
  };

  return (
    <label className="flex flex-1 flex-col rounded-full border border-line px-5 py-2 focus-within:border-ink">
      <span className="text-xs text-muted">{label}</span>
      <span className="flex items-center">
        <span className="mr-1">₹</span>
        <input
          inputMode="numeric"
          value={text}
          placeholder={openEnded ? `${price(PRICE_MAX).replace("₹", "")}+` : "0"}
          onChange={(e) => setText(e.target.value.replace(/[^\d,]/g, ""))}
          onBlur={() => {
            commit();
            setText(shown); // if the commit clamped to the current value, show it
          }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && (e.currentTarget.blur(), e.preventDefault())}
          className="w-full bg-transparent outline-none"
        />
      </span>
    </label>
  );
}
