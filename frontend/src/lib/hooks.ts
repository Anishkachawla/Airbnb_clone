"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export function useClickOutside(ref: RefObject<HTMLElement>, onOutside: () => void, active = true) {
  const cb = useRef(onOutside);
  cb.current = onOutside;
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, active]);
}

export function useScrolled(threshold = 0): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/**
 * Whether the explore header should condense. Uses hysteresis (condense past 64px, expand above 8px) and
 * refuses to condense on pages too short to stay scrolled once the header shrinks (~130px), which would
 * otherwise clamp scrollY back to 0 and make the header flicker.
 */
export function useHeaderCondensed(): boolean {
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const room = document.documentElement.scrollHeight - window.innerHeight;
      setCondensed((c) => (c ? y > 8 : y > 64 && room > 220));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return condensed;
}
