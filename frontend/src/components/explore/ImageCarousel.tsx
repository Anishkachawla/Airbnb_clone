"use client";

import { useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";

/** Card photo slider: arrows on hover (desktop), swipe gestures (touch), dots indicator. */
export function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  const go = (e: MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => Math.min(count - 1, Math.max(0, i + delta)));
  };

  // Touch: swipe left/right to change photo (the arrows only appear on hover-capable screens)
  const touchX = useRef<number | null>(null);
  const swipe = {
    onTouchStart: (e: TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: TouchEvent) => {
      if (touchX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      touchX.current = null;
      if (Math.abs(dx) > 40) setIndex((i) => Math.min(count - 1, Math.max(0, i + (dx < 0 ? 1 : -1))));
    },
  };

  const arrow = "absolute top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#222] shadow-pill transition hover:scale-105 hover:bg-white md:group-hover:flex";

  return (
    <div className="relative aspect-[20/19] touch-pan-y overflow-hidden rounded-[20px] bg-soft" {...swipe}>
      <div className="flex h-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <Img key={src + i} src={src} alt={i === 0 ? alt : ""} className="h-full w-full shrink-0 object-cover" />
        ))}
      </div>
      {index > 0 && <button onClick={(e) => go(e, -1)} aria-label="Previous photo" className={`${arrow} left-3`}><Icon name="chevron-left" size={12} strokeWidth={4} /></button>}
      {index < count - 1 && <button onClick={(e) => go(e, 1)} aria-label="Next photo" className={`${arrow} right-3`}><Icon name="chevron-right" size={12} strokeWidth={4} /></button>}
      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full bg-white transition ${i === index ? "opacity-100" : "opacity-60"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
