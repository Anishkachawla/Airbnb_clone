import Link from "next/link";
import type { ReactNode } from "react";

export function ComingSoon({ art, title, body }: { art: ReactNode; title: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-4 px-6 py-20">
      {art}
      <h1 className="text-[32px] font-semibold leading-tight">{title}</h1>
      <p className="text-muted">{body}</p>
      <span className="rounded-full bg-soft px-3 py-1 text-sm font-semibold">Coming soon</span>
      <Link href="/" className="btn-outline mt-4">Explore homes</Link>
    </div>
  );
}
