"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EMPTY_GUESTS, parseExplore, toQueryString, type GuestCounts } from "@/lib/searchParams";

export interface SearchDraft {
  location: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: GuestCounts;
}

/** Editable copy of the where/when/who part of the URL; `submit` writes it back (keeping filters). */
export function useSearchDraft() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = useMemo(() => parseExplore(new URLSearchParams(searchParams.toString())), [searchParams]);

  const [draft, setDraft] = useState<SearchDraft>({
    location: current.location, checkIn: current.checkIn, checkOut: current.checkOut, guests: current.guests,
  });

  const reset = useCallback(() => {
    setDraft({ location: current.location, checkIn: current.checkIn, checkOut: current.checkOut, guests: current.guests });
  }, [current]);

  // Re-sync whenever the URL changes underneath us
  useEffect(() => {
    reset();
  }, [reset]);

  const clear = useCallback(() => setDraft({ location: "", checkIn: null, checkOut: null, guests: EMPTY_GUESTS }), []);

  const submit = useCallback(() => {
    const onExplore = pathname === "/" || pathname === "/homes";
    const keepFilters = onExplore ? current : parseExplore(new URLSearchParams());
    const dates = draft.checkIn && draft.checkOut ? { checkIn: draft.checkIn, checkOut: draft.checkOut } : { checkIn: null, checkOut: null };
    router.push((onExplore ? pathname : "/") + toQueryString({ ...keepFilters, location: draft.location, guests: draft.guests, ...dates }));
  }, [current, draft, pathname, router]);

  return { draft, setDraft, submit, reset, clear, current };
}
