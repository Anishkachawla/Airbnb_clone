"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

/** Bottom tab bar on small screens, as in Airbnb's mobile web app. */
export function MobileNav() {
  const pathname = usePathname();
  const { user, openLogin } = useAuth();
  // These pages have their own fixed bottom bar (reserve / checkout / wizard footer)
  if (["/rooms/", "/book/", "/hosting/listings"].some((p) => pathname.startsWith(p))) return null;
  const tabs: { href: string; label: string; icon: IconName }[] = [
    { href: "/", label: "Explore", icon: "search" },
    { href: "/wishlists", label: "Wishlists", icon: "heart" },
    ...(user
      ? [
          { href: "/trips", label: "Trips", icon: "home" as IconName },
          { href: "/messages", label: "Messages", icon: "message" as IconName },
          { href: "/hosting", label: user.is_host ? "Hosting" : "Host", icon: "key" as IconName },
        ]
      : []),
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line bg-surface pb-[max(env(safe-area-inset-bottom),8px)] pt-2 md:hidden">
      {tabs.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`flex flex-col items-center gap-1 text-2xs font-semibold ${active ? "text-rausch" : "text-muted"}`}>
            <Icon name={t.icon} size={24} strokeWidth={active ? 2.2 : 1.8} />
            {t.label}
          </Link>
        );
      })}
      {!user && (
        <button onClick={openLogin} className="flex flex-col items-center gap-1 text-2xs font-semibold text-muted">
          <Icon name="user" size={24} strokeWidth={1.8} />
          Log in
        </button>
      )}
    </nav>
  );
}
