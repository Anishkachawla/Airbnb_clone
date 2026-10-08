"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { ListingCard, SearchParams } from "@/lib/types";

const PAGE_SIZE = 18;

/** Paged search that resets when the query changes and appends on `loadMore` (infinite scroll). */
export function useListingSearch(params: SearchParams, enabled = true) {
  const [items, setItems] = useState<ListingCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify(params);
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (p: number) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const res = await api.listings.search(JSON.parse(key) as SearchParams, p, PAGE_SIZE);
        if (id !== requestId.current) return; // a newer search superseded this one
        setItems((prev) => (p === 1 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setPage(res.page);
        setPages(res.pages);
      } catch (e) {
        if (id === requestId.current) setError((e as Error).message);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [key],
  );

  useEffect(() => {
    if (!enabled) return;
    setItems([]);
    fetchPage(1);
  }, [fetchPage, enabled]);

  const hasMore = page < pages;
  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchPage(page + 1);
  }, [loading, hasMore, page, fetchPage]);

  return { items, total, loading, error, hasMore, loadMore, retry: () => fetchPage(1) };
}
