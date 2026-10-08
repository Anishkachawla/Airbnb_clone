"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CATEGORIES } from "@/lib/constants";

interface Props {
  active: string | null;
  onSelect: (key: string | null) => void;
  filterCount: number;
  onOpenFilters: () => void;
}

export function CategoryBar({ active, onSelect, filterCount, onOpenFilters }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, []);

  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.7, behavior: "smooth" });
  const arrow = "absolute top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface shadow-pill hover:scale-105 md:flex";

  return (
    <div className="flex items-center gap-6">
      <div className="relative min-w-0 flex-1">
        {!edges.start && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-20 bg-gradient-to-r from-surface via-surface to-transparent" />
            <button onClick={() => scroll(-1)} aria-label="Previous categories" className={`${arrow} left-0`}><Icon name="chevron-left" size={12} strokeWidth={4} /></button>
          </>
        )}
        <div ref={scroller} onScroll={updateEdges} className="no-scrollbar flex gap-8 overflow-x-auto md:gap-10" role="tablist">
          {CATEGORIES.map((c) => {
            const selected = active === c.key;
            return (
              <button
                key={c.key}
                role="tab"
                aria-selected={selected}
                onClick={() => onSelect(selected ? null : c.key)}
                className={`group flex shrink-0 flex-col items-center gap-2 border-b-2 pb-2.5 pt-3 transition ${
                  selected ? "border-ink text-ink" : "border-transparent text-muted hover:border-line hover:text-ink"
                }`}
              >
                <Icon name={c.icon} size={24} strokeWidth={1.6} className={selected ? "" : "opacity-70 group-hover:opacity-100"} />
                <span className="whitespace-nowrap text-xs font-semibold">{c.label}</span>
              </button>
            );
          })}
        </div>
        {!edges.end && (
          <>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-20 bg-gradient-to-l from-surface via-surface to-transparent" />
            <button onClick={() => scroll(1)} aria-label="More categories" className={`${arrow} right-0`}><Icon name="chevron-right" size={12} strokeWidth={4} /></button>
          </>
        )}
      </div>
      <button onClick={onOpenFilters} className="relative hidden shrink-0 items-center gap-2 rounded-xl border border-line px-4 py-3.5 text-xs font-semibold hover:border-ink hover:bg-soft md:flex">
        <Icon name="filters" size={16} /> Filters
        {filterCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-2xs font-bold text-surface ring-2 ring-surface">{filterCount}</span>
        )}
      </button>
    </div>
  );
}
