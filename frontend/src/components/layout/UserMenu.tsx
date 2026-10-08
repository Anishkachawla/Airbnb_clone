"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useClickOutside } from "@/lib/hooks";

/**
 * Profile circle + menu circle (Airbnb's 2025 header). The menu always contains a mode switch:
 * "Switch to travelling" while hosting, "Switch to hosting" for hosts, "Become a host" otherwise.
 */
export function UserMenu() {
  const { user, logout, openLogin } = useAuth();
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const pathname = usePathname();
  const hosting = pathname.startsWith("/hosting");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const close = () => setOpen(false);
  const item = "flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm hover:bg-soft";
  const circle = "flex h-12 w-12 items-center justify-center rounded-full bg-soft transition hover:bg-hover";

  const modeSwitch = hosting ? (
    <Link href="/" onClick={close} className={`${item} font-semibold`}>Switch to travelling <Icon name="globe" size={18} /></Link>
  ) : user?.is_host ? (
    <Link href="/hosting" onClick={close} className={`${item} font-semibold`}>Switch to hosting <Icon name="key" size={18} /></Link>
  ) : (
    <Link href="/hosting" onClick={close} className={`${item} items-start`}>
      <span>
        <span className="block font-semibold">Become a host</span>
        <span className="block text-xs text-muted">It&apos;s easy to start hosting and earn extra income.</span>
      </span>
      <Icon name="home" size={28} strokeWidth={1.5} className="shrink-0" />
    </Link>
  );

  const themeItem = (
    <button onClick={toggle} className={item}>
      {theme === "dark" ? "Light mode" : "Dark mode"} <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
    </button>
  );
  const help = (
    <button onClick={() => { close(); toast.show("Help Centre is coming soon"); }} className={item}>
      Help Centre <Icon name="question" size={18} />
    </button>
  );

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <button
        onClick={() => (user ? setOpen((o) => !o) : openLogin())}
        aria-label={user ? `Account menu for ${user.name}` : "Log in or sign up"}
        className={circle}
      >
        {user ? (
          <Avatar name={user.name} src={user.avatar_url} size={34} />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink">
            <Icon name="user" size={16} strokeWidth={2.4} />
          </span>
        )}
      </button>
      <button onClick={() => setOpen((o) => !o)} aria-label="Main menu" aria-expanded={open} className={circle}>
        <Icon name="menu" size={18} strokeWidth={2.4} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 animate-fade-in overflow-hidden rounded-2xl bg-surface py-2 shadow-float ring-1 ring-line">
          {user ? (
            <>
              <div className="px-5 pb-2 pt-1 text-xs text-muted">Signed in as <span className="font-semibold text-ink">{user.name}</span></div>
              <Link href="/wishlists" onClick={close} className={item}>Wishlists <Icon name="heart" size={18} /></Link>
              <Link href="/trips" onClick={close} className={item}>Trips <Icon name="cat-tiny" size={18} /></Link>
              <Link href="/messages" onClick={close} className={item}>Messages <Icon name="message" size={18} /></Link>
              <hr className="my-2 border-line" />
              {modeSwitch}
              {user.is_host && (
                <Link href="/hosting/listings/new" onClick={close} className={item}>Create a new listing <Icon name="plus" size={18} /></Link>
              )}
              <hr className="my-2 border-line" />
              {themeItem}
              {help}
              <button onClick={() => { close(); logout(); toast.show("You're logged out"); }} className={item}>Log out</button>
            </>
          ) : (
            <>
              {help}
              <hr className="my-2 border-line" />
              {modeSwitch}
              <hr className="my-2 border-line" />
              <button onClick={() => { close(); openLogin(); }} className={`${item} font-semibold`}>Log in or sign up</button>
              {themeItem}
            </>
          )}
        </div>
      )}
    </div>
  );
}
