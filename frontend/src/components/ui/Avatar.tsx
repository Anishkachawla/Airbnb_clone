"use client";

import { useState } from "react";
import { Icon } from "./Icon";

export function Avatar({ name, src, size = 40, badge }: { name: string; src?: string | null; size?: number; badge?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} onError={() => setFailed(true)} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full bg-ink font-semibold text-surface"
          style={{ fontSize: size * 0.42 }}
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      {badge && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-[38%] w-[38%] items-center justify-center rounded-full bg-gradient-to-br from-[#E61E4D] to-[#D70466] text-white ring-2 ring-surface">
          <Icon name="medal" size={Math.max(8, size * 0.22)} strokeWidth={2.5} />
        </span>
      )}
    </span>
  );
}
