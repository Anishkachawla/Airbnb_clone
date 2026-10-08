"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

type Tone = "default" | "error";
interface Toast {
  id: number;
  message: string;
  tone: Tone;
  action?: { label: string; href: string };
  image?: string;
}

interface ToastApi {
  show: (message: string, opts?: { tone?: Tone; action?: Toast["action"]; image?: string }) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback<ToastApi["show"]>(
    (message, opts = {}) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t.slice(-2), { id, message, tone: opts.tone ?? "default", action: opts.action, image: opts.image }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );
  const error = useCallback((message: string) => show(message, { tone: "error" }), [show]);
  // Stable identity: consumers list `toast` in effect deps, so a new object per render would loop
  const api = useMemo(() => ({ show, error }), [show, error]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-24 left-4 right-4 z-[200] flex flex-col gap-2 md:bottom-6 md:left-6 md:right-auto md:w-[380px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex animate-toast-in items-center gap-3 rounded-xl bg-surface p-3 shadow-float ring-1 ring-line"
          >
            {t.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.tone === "error" ? "bg-rausch/10 text-rausch" : "bg-soft"}`}>
                <Icon name={t.tone === "error" ? "flag" : "check"} size={16} strokeWidth={2.5} />
              </span>
            )}
            <p className="flex-1 text-sm font-semibold">{t.message}</p>
            {t.action && (
              <Link href={t.action.href} onClick={() => dismiss(t.id)} className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold underline hover:bg-soft">
                {t.action.label}
              </Link>
            )}
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="shrink-0 rounded-full p-1.5 hover:bg-soft">
              <Icon name="close" size={12} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
