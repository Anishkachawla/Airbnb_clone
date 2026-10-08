"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LoginModal } from "@/components/layout/LoginModal";
import { api, USER_STORAGE_KEY } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthApi {
  user: User | null;
  /** False until we've checked localStorage, so pages don't flash a logged-out state. */
  ready: boolean;
  login: (userId: number) => Promise<void>;
  logout: () => void;
  openLogin: () => void;
  /** Runs `action` if logged in, otherwise opens the login modal. */
  requireUser: (action: (user: User) => void) => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthApi | null>(null);

function storeUserId(id: number | null) {
  try {
    if (id === null) localStorage.removeItem(USER_STORAGE_KEY);
    else localStorage.setItem(USER_STORAGE_KEY, String(id));
  } catch {
    /* private mode: the session still works until reload */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(USER_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (!stored) {
      setReady(true);
      return;
    }
    api.users
      .me()
      .then(setUser)
      .catch(() => storeUserId(null))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (userId: number) => {
    storeUserId(userId);
    const me = await api.users.me();
    setUser(me);
    setLoginOpen(false);
  }, []);

  const logout = useCallback(() => {
    storeUserId(null);
    setUser(null);
  }, []);

  const requireUser = useCallback(
    (action: (u: User) => void) => {
      if (user) action(user);
      else setLoginOpen(true);
    },
    [user],
  );

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const value = useMemo(
    () => ({ user, ready, login, logout, openLogin, requireUser, setUser }),
    [user, ready, login, logout, openLogin, requireUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
