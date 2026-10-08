"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/lib/types";
import { Spinner } from "./Spinner";

/** Renders children only for a logged-in user; otherwise a prompt that opens the login modal. */
export function RequireUser({ children, title = "Log in to continue", body }: { children: (user: User) => ReactNode; title?: string; body?: string }) {
  const { user, ready, openLogin } = useAuth();
  if (!ready) return <div className="flex justify-center py-32"><Spinner /></div>;
  if (!user) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-6 py-24">
        <h1 className="text-[32px] font-semibold">{title}</h1>
        {body && <p className="text-muted">{body}</p>}
        <button onClick={openLogin} className="btn-brand">Log in</button>
      </div>
    );
  }
  return <>{children(user)}</>;
}
