"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Tailwind max-width class for the dialog on desktop. */
  width?: string;
  /** Full-screen sheet (photo tour, mobile search). */
  fullscreen?: boolean;
}

/** Airbnb-style dialog: centred card on desktop, bottom sheet on mobile. Escape / backdrop click closes. */
export function Modal({ open, onClose, title, children, footer, width = "max-w-xl", fullscreen }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  // Callers pass inline arrows; keep the latest in a ref so the effect below runs only on open/close
  // (re-running it would steal focus from inputs inside the dialog on every parent render).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!panel.current?.contains(document.activeElement)) panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        className={
          fullscreen
            ? "relative flex h-full w-full animate-slide-up flex-col bg-surface outline-none"
            : `relative flex max-h-[92vh] w-full ${width} animate-slide-up flex-col rounded-t-2xl bg-surface shadow-float outline-none md:max-h-[88vh] md:rounded-xl`
        }
      >
        <header className="relative flex min-h-[64px] shrink-0 items-center justify-center border-b border-line px-14">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-full hover:bg-soft"
          >
            <Icon name={fullscreen ? "chevron-left" : "close"} size={16} strokeWidth={2.5} />
          </button>
          {title && <h2 className="text-base font-bold">{title}</h2>}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <footer className="shrink-0 border-t border-line px-6 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
