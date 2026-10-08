"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GRID, ListingCard } from "@/components/explore/ListingCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RequireUser } from "@/components/ui/RequireUser";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { ListingCard as Card } from "@/lib/types";

export default function WishlistsPage() {
  return (
    <>
      <Header variant="detail" />
      <RequireUser title="Wishlists" body="Log in to view your wishlists. You can create, view, or edit wishlists once you've logged in.">
        {() => <Wishlist />}
      </RequireUser>
      <Footer narrow />
    </>
  );
}

function Wishlist() {
  const [items, setItems] = useState<Card[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.wishlist.list().then(setItems).catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="mx-auto max-w-page px-6 pb-16 pt-10 xl:px-10 2xl:px-20">
      <h1 className="mb-8 text-[32px] font-semibold">Wishlists</h1>
      {error && <p className="text-rausch-dark">{error}</p>}
      {!items && !error && <div className="flex justify-center py-24"><Spinner /></div>}
      {items?.length === 0 && (
        <div className="max-w-md">
          <h2 className="text-[22px] font-semibold">Create your first wishlist</h2>
          <p className="mb-6 mt-2 text-muted">As you search, tap the heart icon to save your favorite places to stay to a wishlist.</p>
          <Link href="/" className="btn-dark inline-block">Start exploring</Link>
        </div>
      )}
      {!!items?.length && (
        <>
          <p className="mb-6 text-muted">Saved · {items.length} {items.length === 1 ? "home" : "homes"}</p>
          <div className={GRID}>
            {items.map((l) => (
              <ListingCard key={l.id} listing={l} onWishlistChange={(saved) => !saved && setItems((xs) => xs?.filter((x) => x.id !== l.id) ?? null)} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
