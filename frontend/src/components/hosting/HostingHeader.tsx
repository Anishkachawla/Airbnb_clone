"use client";

import Link from "next/link";
import { UserMenu } from "@/components/layout/UserMenu";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export type HostTab = "today" | "listings";

export function HostingHeader({ tab, onTab, showTabs = true }: { tab: HostTab; onTab: (t: HostTab) => void; showTabs?: boolean }) {
  const tabBtn = (key: HostTab, label: string) => (
    <button
      onClick={() => onTab(key)}
      aria-current={tab === key ? "page" : undefined}
      className={`relative rounded-full px-4 py-2.5 text-[15px] font-semibold transition ${tab === key ? "text-ink" : "text-muted hover:bg-soft hover:text-ink"}`}
    >
      {label}
      {tab === key && <span className="absolute inset-x-4 -bottom-1 h-[3px] rounded-full bg-ink" />}
    </button>
  );
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-4 px-6 py-4 md:h-[88px] md:flex-nowrap md:py-0 xl:px-10 2xl:px-20">
        {/* The logo leads back to the traveller side, as does the always-visible switch on the right */}
        <div className="min-w-0 md:flex-1"><Logo href="/" /></div>
        {showTabs && (
          <nav className="order-last mt-2 flex w-full justify-center gap-1 md:order-none md:mt-0 md:w-auto">{tabBtn("today", "Today")}{tabBtn("listings", "Listings")}</nav>
        )}
        <div className="flex min-w-0 items-center justify-end gap-2 md:flex-1">
          <Link href="/" className="flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-3 text-[15px] font-semibold hover:bg-soft sm:px-4">
            <Icon name="globe" size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Switch to travelling</span>
            <span className="sr-only sm:hidden">Switch to travelling</span>
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
