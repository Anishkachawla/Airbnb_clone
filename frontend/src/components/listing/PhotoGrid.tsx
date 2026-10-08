"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Modal } from "@/components/ui/Modal";

/** 1 large + 4 small photo mosaic (desktop), swipeable strip (mobile), and the full "photo tour". */
export function PhotoGrid({ images, title, overlay }: { images: string[]; title: string; overlay?: ReactNode }) {
  const [tourOpen, setTourOpen] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const grid = images.slice(0, 5);

  useEffect(() => {
    if (viewer === null) return;
    // Capture phase on window runs before the Modal's document listener, so Escape closes only the viewer
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewer(null);
      else if (e.key === "ArrowLeft") setViewer((v) => (v !== null && v > 0 ? v - 1 : v));
      else if (e.key === "ArrowRight") setViewer((v) => (v !== null && v < images.length - 1 ? v + 1 : v));
      else return;
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [viewer, images.length]);

  return (
    <>
      {/* Mobile: full-bleed scroll-snap strip */}
      <div className="relative -mx-6 md:hidden">
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => setMobileIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {images.map((src, i) => (
            <button key={src + i} onClick={() => setTourOpen(true)} className="w-full shrink-0 snap-center">
              <Img src={src} alt={i === 0 ? title : ""} className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
        <span className="absolute bottom-4 right-4 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
          {mobileIndex + 1} / {images.length}
        </span>
        {overlay}
      </div>

      {/* Desktop mosaic */}
      <div className="relative hidden h-[min(560px,46vw)] gap-2 overflow-hidden rounded-xl md:grid md:grid-cols-4 md:grid-rows-2">
        {grid.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setTourOpen(true)}
            className={`group relative overflow-hidden bg-soft ${i === 0 ? "col-span-2 row-span-2" : ""} ${grid.length < 5 && i === 0 ? "col-span-4" : ""}`}
          >
            <Img src={src} alt={i === 0 ? title : ""} className="h-full w-full object-cover transition group-hover:brightness-90" />
          </button>
        ))}
        <button
          onClick={() => setTourOpen(true)}
          className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg border border-[#222] bg-white px-4 py-1.5 text-sm font-semibold text-[#222] hover:bg-[#f7f7f7]"
        >
          <Icon name="grid" size={16} strokeWidth={1.5} /> Show all photos
        </button>
      </div>

      <Modal open={tourOpen} onClose={() => setTourOpen(false)} fullscreen title="Photo tour">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 p-6">
          {images.map((src, i) => (
            <button key={src + i} onClick={() => setViewer(i)} className={i % 3 === 0 ? "col-span-2" : ""}>
              <Img src={src} alt={`${title} photo ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </Modal>

      {viewer !== null && (
        <div className="fixed inset-0 z-[150] flex flex-col bg-black text-white" role="dialog" aria-label="Photo viewer">
          <div className="flex items-center justify-between p-6">
            <button onClick={() => setViewer(null)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10">
              <Icon name="close" size={14} strokeWidth={3} /> Close
            </button>
            <span className="text-sm">{viewer + 1} / {images.length}</span>
            <span className="w-20" />
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-10 md:px-24">
            <Img src={images[viewer]} alt={`${title} photo ${viewer + 1}`} className="max-h-full max-w-full object-contain" />
            {viewer > 0 && (
              <button onClick={() => setViewer(viewer - 1)} aria-label="Previous" className="absolute left-4 rounded-full border border-white/60 p-3 hover:bg-white/10 md:left-10">
                <Icon name="chevron-left" size={16} strokeWidth={3} />
              </button>
            )}
            {viewer < images.length - 1 && (
              <button onClick={() => setViewer(viewer + 1)} aria-label="Next" className="absolute right-4 rounded-full border border-white/60 p-3 hover:bg-white/10 md:right-10">
                <Icon name="chevron-right" size={16} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
