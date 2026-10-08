import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

/** Logo-only header used during checkout and listing creation (no distractions). */
export function MinimalHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-20 max-w-page items-center justify-between px-6 xl:px-10 2xl:px-20">
        <Logo />
        {right}
      </div>
    </header>
  );
}
