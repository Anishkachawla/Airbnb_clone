"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { BRAND_NAME } from "@/lib/format";
import type { User } from "@/lib/types";

/** Mocked sign-in: pick one of the seeded accounts. Real phone/email auth is out of scope. */
export function LoginModal({ open, onClose, onLogin }: { open: boolean; onClose: () => void; onLogin: (id: number) => Promise<void> }) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    if (!open || users) return;
    api.users.list().then(setUsers).catch((e: Error) => setError(e.message));
  }, [open, users]);

  async function choose(id: number) {
    setPending(id);
    try {
      await onLogin(id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }

  const role = (u: User) => (u.is_superhost ? "Superhost" : u.is_host ? "Host" : "Guest");

  return (
    <Modal open={open} onClose={onClose} title="Log in or sign up" width="max-w-[568px]">
      <div className="p-6">
        <h3 className="mb-1 text-[22px] font-semibold">Welcome to {BRAND_NAME}</h3>
        <p className="mb-5 text-sm text-muted">
          This is a demo, so there are no passwords. Choose an account to continue as — hosts can manage listings, guests can book.
        </p>
        {error && <p className="mb-4 rounded-lg bg-rausch/10 p-3 text-sm text-rausch-dark">{error}</p>}
        {!users && !error && <div className="flex justify-center py-10"><Spinner /></div>}
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {users?.map((u) => (
            <li key={u.id}>
              <button
                onClick={() => choose(u.id)}
                disabled={pending !== null}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-soft disabled:opacity-60"
              >
                <Avatar name={u.name} src={u.avatar_url} size={40} badge={u.is_superhost} />
                <span className="flex-1">
                  <span className="block font-semibold">{u.name}</span>
                  <span className="block text-sm text-muted">{u.email}</span>
                </span>
                {pending === u.id ? (
                  <Spinner />
                ) : (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.is_host ? "bg-ink text-surface" : "bg-soft"}`}>{role(u)}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-muted">Phone, email and social sign-in are coming soon.</p>
      </div>
    </Modal>
  );
}
