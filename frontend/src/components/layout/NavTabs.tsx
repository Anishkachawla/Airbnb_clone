"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { BalloonIcon, BellIcon, GlobeIcon, HouseIcon } from "@/components/ui/TabIcons";

const TABS: { href: string; label: string; Art: ComponentType<{ size?: number }> }[] = [
  { href: "/", label: "All", Art: GlobeIcon },
  { href: "/homes", label: "Homes", Art: HouseIcon },
  { href: "/experiences", label: "Experiences", Art: BalloonIcon },
  { href: "/services", label: "Services", Art: BellIcon },
];

/** The "All / Homes / Experiences / Services" switcher at the top of traveller pages. */
export function NavTabs({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="What are you looking for" className={`flex ${compact ? "justify-around" : "items-end gap-4 lg:gap-10"}`}>
      {TABS.map(({ href, label, Art }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center transition ${
              compact ? "flex-col gap-0.5 pb-2 text-xs" : "gap-2.5 pb-3 text-base"
            } ${active ? "font-semibold text-ink" : "text-muted hover:text-ink"}`}
          >
            <span
              className={`transition-transform duration-200 group-hover:scale-110 ${compact ? "" : "[&>svg]:h-9 [&>svg]:w-9 lg:[&>svg]:h-12 lg:[&>svg]:w-12"}`}
            >
              <Art size={compact ? 32 : 48} />
            </span>
            {label}
            <span
              className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-ink transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
