"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { createMap, useLeaflet } from "@/components/explore/MapView";
import { Icon } from "@/components/ui/Icon";

/** Approximate location (a soft circle, not the exact address) on a non-scrolling map. */
export function LocationMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const L = useLeaflet();
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);

  useEffect(() => {
    if (!L || !el.current || map.current) return;
    map.current = createMap(L, el.current, { center: [lat, lng], zoom: 13, scrollWheelZoom: false });
    L.circle([lat, lng], { radius: 600, color: "#FF385C", weight: 0, fillOpacity: 0.18 }).addTo(map.current);
    L.marker([lat, lng], {
      icon: L.divIcon({
        className: "pin-wrap",
        html: '<span style="display:flex;width:48px;height:48px;transform:translate(-50%,-50%);border-radius:9999px;background:#FF385C;box-shadow:0 0 0 6px rgba(255,56,92,.2);align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/></svg></span>',
        iconSize: [0, 0],
      }),
    }).addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [L, lat, lng]);

  return (
    <section className="border-b border-line py-12">
      <h2 className="mb-6 text-[22px] font-semibold">Where you&apos;ll be</h2>
      <div ref={el} className="isolate h-[300px] overflow-hidden rounded-xl bg-soft md:h-[480px]" />
      <p className="mt-6 flex items-center gap-2 font-semibold"><Icon name="pin" size={18} /> {label}</p>
      <p className="mt-1 text-sm text-muted">Exact location is provided after booking.</p>
    </section>
  );
}
