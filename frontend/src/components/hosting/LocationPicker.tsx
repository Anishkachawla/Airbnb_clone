"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { createMap, useLeaflet } from "@/components/explore/MapView";

/** Click (or drag the pin) to set the listing's coordinates. */
export function LocationPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
  const L = useLeaflet();
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const marker = useRef<Leaflet.Marker | null>(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (!L || !el.current || map.current) return;
    map.current = createMap(L, el.current, { center: [lat, lng], zoom: lat === 20.6 ? 4 : 11 });
    marker.current = L.marker([lat, lng], {
      draggable: true,
      icon: L.divIcon({
        className: "pin-wrap",
        html: '<span style="display:block;width:22px;height:22px;transform:translate(-50%,-50%);border-radius:9999px;background:#FF385C;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>',
        iconSize: [0, 0],
      }),
    }).addTo(map.current);
    marker.current.on("dragend", () => {
      const p = marker.current!.getLatLng();
      cb.current(round(p.lat), round(p.lng));
    });
    map.current.on("click", (e: Leaflet.LeafletMouseEvent) => cb.current(round(e.latlng.lat), round(e.latlng.lng)));
    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  useEffect(() => {
    marker.current?.setLatLng([lat, lng]);
  }, [lat, lng]);

  return <div ref={el} className="isolate h-[320px] overflow-hidden rounded-xl border border-line" />;
}

const round = (n: number) => Math.round(n * 1e5) / 1e5;
