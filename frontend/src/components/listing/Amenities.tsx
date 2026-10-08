"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { Amenity } from "@/lib/types";

const asIcon = (key: string) => key as IconName;

export function Amenities({ amenities }: { amenities: Amenity[] }) {
  const [open, setOpen] = useState(false);
  // Group for the modal, keeping first-seen section order
  const sections = amenities.reduce<Map<string, Amenity[]>>((m, a) => m.set(a.section, [...(m.get(a.section) ?? []), a]), new Map());
  return (
    <section className="border-b border-line py-12">
      <h2 className="mb-6 text-[22px] font-semibold">What this place offers</h2>
      <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {amenities.slice(0, 10).map((a) => (
          <li key={a.id} className="flex items-center gap-4">
            <Icon name={asIcon(a.icon)} size={24} strokeWidth={1.5} /> {a.name}
          </li>
        ))}
      </ul>
      {amenities.length > 6 && (
        <button onClick={() => setOpen(true)} className="btn-outline mt-8">Show all {amenities.length} amenities</button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} width="max-w-[780px]">
        <div className="px-6 pb-8 pt-2">
          <h2 className="mb-6 text-[26px] font-semibold">What this place offers</h2>
          {Array.from(sections, ([section, items]) => (
            <div key={section} className="mb-8">
              <h3 className="mb-2 text-lg font-semibold">{section}</h3>
              <ul className="divide-y divide-line">
                {items.map((a) => (
                  <li key={a.id} className="flex items-center gap-5 py-6">
                    <Icon name={asIcon(a.icon)} size={28} strokeWidth={1.4} /> {a.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Modal>
    </section>
  );
}
