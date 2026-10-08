"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { MobileSearch } from "@/components/search/MobileSearch";
import { SearchBar } from "@/components/search/SearchBar";
import { useSearchDraft } from "@/components/search/useSearchDraft";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { HouseIcon } from "@/components/ui/TabIcons";
import { useAuth } from "@/context/AuthContext";
import { fmt } from "@/lib/dates";
import { useHeaderCondensed } from "@/lib/hooks";
import { guestLabel } from "@/lib/searchParams";
import { NavTabs } from "./NavTabs";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  /** explore: sticky; tabs + big search bar at the top, condensing on scroll. detail: compact pill, narrower page. */
  variant?: "explore" | "detail";
  onOpenFilters?: () => void;
  /** Keep the compact pill even at the top of the page (map mode needs a fixed-height header). */
  condensed?: boolean;
  /** Rendered inside the sticky header, below the search (e.g. the results page's category bar). */
  children?: ReactNode;
}

/** Suspense boundary is required because the header reads the URL's search params. */
export function Header(props: HeaderProps) {
  return (
    <Suspense fallback={<div className={`h-[140px] border-b border-line ${props.variant === "detail" ? "md:h-[89px]" : "md:h-[218px]"}`} />}>
      <HeaderInner {...props} />
    </Suspense>
  );
}

function HeaderInner({ variant = "explore", onOpenFilters, condensed = false, children }: HeaderProps) {
  const search = useSearchDraft();
  const scrolled = useHeaderCondensed();
  const { user } = useAuth();
  const [forcedOpen, setForcedOpen] = useState(false);

  // Tabs + big bar show at the top of explore pages, or when the compact pill is clicked
  const expanded = forcedOpen || (variant === "explore" && !scrolled && !condensed);
  useEffect(() => {
    if (scrolled) setForcedOpen(false);
  }, [scrolled]);

  const { current } = search;
  const width = variant === "explore" ? "max-w-page px-6 xl:px-10 2xl:px-20" : "max-w-detail px-6 lg:px-10";

  return (
    <>
      <header
        className={`${variant === "explore" ? "sticky" : "relative hidden md:block"} top-0 z-40 border-b border-line ${
          expanded ? "bg-gradient-to-b from-surface to-soft" : "bg-surface"
        }`}
      >
        {/* Mobile: search pill + compact tabs (detail pages use a back button over the photos instead) */}
        <div className={`px-6 pt-3.5 md:hidden ${variant === "detail" ? "hidden" : ""}`}>
          <MobileSearch onOpenFilters={onOpenFilters} />
          <div className="mt-3"><NavTabs compact /></div>
        </div>

        {/* Desktop */}
        <div className={`mx-auto hidden md:block ${width}`}>
          <div className={`flex items-center justify-between gap-4 ${expanded ? "h-[104px]" : "h-[88px]"}`}>
            <div className="flex-1"><Logo /></div>

            {expanded ? (
              <div className="self-end"><NavTabs /></div>
            ) : (
              <button
                onClick={() => {
                  search.reset();
                  setForcedOpen(true);
                }}
                className="flex items-center rounded-full border border-line bg-surface py-1.5 pl-2 pr-2 text-sm shadow-search transition hover:shadow-card"
              >
                <HouseIcon size={34} />
                <span className="ml-2 max-w-[160px] truncate font-semibold">{current.location || "Anywhere"}</span>
                <span className="mx-4 h-6 w-px bg-line" />
                <span className="font-semibold">{current.checkIn && current.checkOut ? fmt.range(current.checkIn, current.checkOut) : "Anytime"}</span>
                <span className="mx-4 h-6 w-px bg-line" />
                <span className={current.guests.adults ? "font-semibold" : "text-muted"}>{guestLabel(current.guests)}</span>
                <span className="ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-rausch text-white">
                  <Icon name="search" size={14} strokeWidth={3.5} />
                </span>
              </button>
            )}

            <div className="flex flex-1 items-center justify-end gap-2">
              <Link
                href="/hosting"
                title={user?.is_host ? "Switch to hosting" : "Become a host"}
                className="flex items-center whitespace-nowrap rounded-full px-3 py-3 text-[15px] font-semibold hover:bg-soft lg:px-4"
              >
                <Icon name="key" size={18} className="lg:hidden" />
                <span className="sr-only lg:not-sr-only">{user?.is_host ? "Switch to hosting" : "Become a host"}</span>
              </Link>
              <UserMenu />
            </div>
          </div>

          {expanded && (
            <div className="pb-8 pt-4">
              <SearchBar search={search} onDone={() => setForcedOpen(false)} />
            </div>
          )}
        </div>
        {children}
      </header>
      {forcedOpen && <div className="fixed inset-0 z-30 hidden bg-black/25 md:block" onClick={() => setForcedOpen(false)} />}
    </>
  );
}
