"use client";

import { useState, type MouseEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";

interface Props {
  listingId: number;
  initial: boolean;
  image?: string;
  /** "overlay": white-outlined heart on a photo. "inline": "♡ Save" text button on the detail page. */
  variant?: "overlay" | "inline";
  onChange?: (saved: boolean) => void;
}

/** Optimistic wishlist toggle; reverts and shows an error toast if the request fails. */
export function HeartButton({ listingId, initial, image, variant = "overlay", onChange }: Props) {
  const { requireUser } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireUser(async () => {
      if (busy) return;
      const next = !saved;
      setSaved(next);
      setBusy(true);
      try {
        await (next ? api.wishlist.add(listingId) : api.wishlist.remove(listingId));
        onChange?.(next);
        toast.show(next ? "Saved to Wishlist" : "Removed from Wishlist", next ? { image, action: { label: "View", href: "/wishlists" } } : { image });
      } catch (err) {
        setSaved(!next);
        toast.error((err as Error).message);
      } finally {
        setBusy(false);
      }
    });
  };

  const heart = (size: number, fill: string, stroke: string, strokeWidth: number) => (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" className="transition-transform active:scale-90">
      <path
        d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );

  if (variant === "inline") {
    return (
      <button onClick={toggle} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold underline hover:bg-soft">
        {heart(16, saved ? "#FF385C" : "none", saved ? "#FF385C" : "currentColor", 2.5)}
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button onClick={toggle} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={saved} className="p-1 hover:scale-110">
      {heart(24, saved ? "#FF385C" : "rgba(0,0,0,0.5)", "white", 2)}
    </button>
  );
}
