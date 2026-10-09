"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { Img } from "@/components/ui/Img";
import { StarSolid } from "@/components/ui/Icon";
import { location, price, rating } from "@/lib/format";
import type { ListingCard } from "@/lib/types";

const TILES = process.env.NEXT_PUBLIC_MAP_TILES_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Leaflet loaded on the client only (it touches `window` at import time). */
export function useLeaflet() {
  const [L, setL] = useState<typeof Leaflet | null>(null);
  useEffect(() => {
    let alive = true;
    import("leaflet").then((mod) => alive && setL(mod.default ?? mod));
    return () => {
      alive = false;
    };
  }, []);
  return L;
}

export function createMap(L: typeof Leaflet, el: HTMLElement, opts: Leaflet.MapOptions = {}) {
  const map = L.map(el, { zoomControl: false, attributionControl: true, ...opts });
  L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
  L.control.zoom({ position: "topright" }).addTo(map);
  return map;
}

/** Explore map with price pins; clicking a pin opens a mini listing card. */
export function MapView({ listings }: { listings: ListingCard[] }) {
  const L = useLeaflet();
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const layer = useRef<Leaflet.LayerGroup | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!L || !el.current || map.current) return;
    map.current = createMap(L, el.current, { center: [20, 40], zoom: 2, worldCopyJump: true });
    layer.current = L.layerGroup().addTo(map.current);
    map.current.on("click", () => setSelected(null));
    // The container resizes when the header expands/collapses; Leaflet must re-measure or tiles go grey
    const ro = new ResizeObserver(() => map.current?.invalidateSize());
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, [L]);

  useEffect(() => {
    if (!L || !map.current || !layer.current) return;
    layer.current.clearLayers();
    listings.forEach((l) => {
      const icon = L.divIcon({
        className: "pin-wrap",
        html: `<span class="price-pin${selected === l.id ? " active" : ""}">${price(l.price_per_night)}</span>`,
        iconSize: [0, 0],
      });
      L.marker([l.latitude, l.longitude], { icon, zIndexOffset: selected === l.id ? 1000 : 0 })
        .on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          setSelected(l.id);
        })
        .addTo(layer.current!);
    });
  }, [L, listings, selected]);

  // Re-frame only when the result set changes, not when a pin is selected
  useEffect(() => {
    if (!L || !map.current || !listings.length) return;
    const bounds = L.latLngBounds(listings.map((l) => [l.latitude, l.longitude] as [number, number]));
    map.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 11 });
  }, [L, listings]);

  const card = listings.find((l) => l.id === selected);

  return (
    <div className="relative isolate h-full w-full">
      <div ref={el} className="h-full w-full" />
      {card && (
        <Link
          href={`/rooms/${card.id}`}
          className="absolute bottom-6 left-1/2 z-[500] w-[327px] -translate-x-1/2 animate-fade-in overflow-hidden rounded-xl bg-surface shadow-float"
        >
          <Img src={card.images[0]} alt={card.title} className="aspect-[2/1] w-full object-cover" />
          <div className="p-3 text-[15px]">
            <div className="flex justify-between">
              <span className="font-semibold">{location(card)}</span>
              <span className="flex items-center gap-1"><StarSolid size={12} />{rating(card.rating)}</span>
            </div>
            <p className="truncate text-muted">{card.title}</p>
            <p className="mt-1"><span className="font-semibold">{price(card.price_per_night)}</span> night</p>
          </div>
        </Link>
      )}
    </div>
  );
}
