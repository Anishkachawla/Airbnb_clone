"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { activeFilterCount, parseExplore, toApiParams, toQueryString, type ExploreState } from "@/lib/searchParams";
import { CategoryBar } from "./CategoryBar";
import { FiltersModal } from "./FiltersModal";
import { HomeRows, PricesPill } from "./HomeRows";
import { GRID, ListingCard, ListingCardSkeleton } from "./ListingCard";
import { MapView } from "./MapView";
import { useListingSearch } from "./useListingSearch";

export function ExplorePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(() => parseExplore(new URLSearchParams(searchParams.toString())), [searchParams]);
  const apiParams = useMemo(() => toApiParams(state), [state]);
  const filterCount = activeFilterCount(state);
  // No search yet → the home page of destination carousels; any search/filter → the results grid
  const searching = !!(state.location || state.checkIn || state.guests.adults || state.category || filterCount);
  const { items, total, loading, error, hasMore, loadMore, retry } = useListingSearch(apiParams, searching);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const update = (next: ExploreState) => router.push(pathname + toQueryString(next), { scroll: false });

  // Infinite scroll: load the next page when the sentinel nears the viewport
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || showMap || !searching) return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, showMap, searching]);

  const pad = "mx-auto max-w-page px-6 xl:px-10 2xl:px-20";

  return (
    <div className={showMap ? "flex h-[100dvh] flex-col" : ""}>
      <Header variant="explore" condensed={showMap} onOpenFilters={() => setFiltersOpen(true)}>
        {searching && (
          <div className={`${pad} md:border-t md:border-line`}>
            <CategoryBar
              active={state.category}
              onSelect={(category) => update({ ...state, category })}
              filterCount={filterCount}
              onOpenFilters={() => setFiltersOpen(true)}
            />
          </div>
        )}
      </Header>

      {!searching ? (
        <main className={`${pad} pb-28 pt-8 md:pt-12`}>
          <HomeRows />
          <PricesPill />
        </main>
      ) : showMap ? (
        <main className="relative min-h-0 flex-1 pb-[calc(58px+env(safe-area-inset-bottom))] md:pb-0">
          <MapView listings={items} />
        </main>
      ) : (
        <main className={`${pad} pb-16 pt-6`}>
          {!loading && !error && total > 0 && (
            <p className="mb-6 text-sm font-semibold">{total === 1 ? "1 home" : `${total} homes`}{state.location ? ` in ${state.location}` : ""} · Prices include all fees</p>
          )}

          {error ? (
            <div className="flex flex-col items-start gap-4 py-16">
              <h2 className="text-[22px] font-semibold">We couldn't load homes</h2>
              <p className="text-muted">{error}</p>
              <button onClick={retry} className="btn-outline">Try again</button>
            </div>
          ) : !loading && items.length === 0 ? (
            <div className="flex flex-col items-start gap-3 py-16">
              <h2 className="text-[22px] font-semibold">No exact matches</h2>
              <p className="text-muted">Try changing or removing some of your filters or adjusting your search area.</p>
              <button onClick={() => update(parseExplore(new URLSearchParams()))} className="btn-outline mt-3">Remove all filters</button>
            </div>
          ) : (
            <div className={GRID}>
              {items.map((l) => (
                <ListingCard key={l.id} listing={l} variant="grid" checkIn={state.checkIn} checkOut={state.checkOut} />
              ))}
              {loading && Array.from({ length: items.length ? 6 : 12 }, (_, i) => <ListingCardSkeleton key={`s${i}`} />)}
            </div>
          )}

          <div ref={sentinel} className="h-1" />
          {!loading && hasMore && (
            <div className="mt-12 flex flex-col items-center gap-4">
              <p className="text-lg font-semibold">Continue exploring</p>
              <button onClick={loadMore} className="btn-dark">Show more</button>
            </div>
          )}
          {loading && items.length > 0 && <div className="mt-10 flex justify-center"><Spinner /></div>}
        </main>
      )}

      {searching && (showMap || items.length > 0) && (
        <button
          onClick={() => {
            setShowMap((m) => !m);
            window.scrollTo({ top: 0 });
          }}
          className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#222] px-5 py-3.5 text-sm font-semibold text-white shadow-float transition hover:scale-105 md:bottom-12"
        >
          {showMap ? <>Show list <Icon name="list" size={16} /></> : <>Show map <Icon name="map" size={16} /></>}
        </button>
      )}

      {!showMap && <Footer />}

      <FiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        state={state}
        onApply={(next) => {
          setFiltersOpen(false);
          update(next);
        }}
      />
    </div>
  );
}

/** Server-rendered placeholder while the client reads the URL (header band + skeleton row). */
export function ExploreFallback() {
  return (
    <>
      <div className="h-[140px] border-b border-line bg-gradient-to-b from-surface to-soft md:h-[218px]" />
      <div className="mx-auto max-w-page px-6 pt-12 xl:px-10 2xl:px-20">
        <div className="skeleton mb-6 h-7 w-72 rounded" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 l2:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => <div key={i} className="skeleton aspect-[20/19] rounded-[20px]" />)}
        </div>
      </div>
    </>
  );
}
