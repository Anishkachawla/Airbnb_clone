"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Icon, StarSolid } from "@/components/ui/Icon";
import { useToast } from "@/context/ToastContext";
import { yearsSince } from "@/lib/dates";
import { firstName, plural, rating } from "@/lib/format";
import type { Host, HostStats } from "@/lib/types";

/** Stats are host-wide (all their listings), like Airbnb's host profile card. */
export function HostCard({ host, stats }: { host: Host; stats: HostStats | null }) {
  const toast = useToast();
  const count = stats?.review_count ?? 0;
  const avg = stats?.rating ?? null;
  const years = yearsSince(host.created_at);
  return (
    <section className="border-b border-line py-12">
      <h2 className="mb-8 text-[22px] font-semibold">Meet your host</h2>
      <div className="grid gap-10 md:grid-cols-[380px_1fr]">
        <div className="grid grid-cols-[1fr_auto] items-center gap-6 rounded-3xl bg-surface p-6 shadow-[0_6px_20px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col items-center text-center">
            <Avatar name={host.name} src={host.avatar_url} size={104} badge={host.is_superhost} />
            <h3 className="mt-3 text-[28px] font-bold leading-tight">{firstName(host.name)}</h3>
            {host.is_superhost && <p className="flex items-center gap-1 text-sm font-semibold"><Icon name="medal" size={14} /> Superhost</p>}
          </div>
          <dl className="divide-y divide-line text-left">
            <div className="pb-3"><dd className="text-[22px] font-bold leading-tight">{count}</dd><dt className="text-2xs font-semibold">Reviews</dt></div>
            <div className="py-3"><dd className="flex items-center gap-1 text-[22px] font-bold leading-tight">{rating(avg)}<StarSolid size={12} /></dd><dt className="text-2xs font-semibold">Rating</dt></div>
            <div className="pt-3"><dd className="text-[22px] font-bold leading-tight">{years}</dd><dt className="text-2xs font-semibold">{years === 1 ? "Year" : "Years"} hosting</dt></div>
          </dl>
        </div>
        <div>
          {host.is_superhost && (
            <>
              <h3 className="mb-2 text-lg font-semibold">{firstName(host.name)} is a Superhost</h3>
              <p className="mb-6 text-muted">Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</p>
            </>
          )}
          {host.bio && <p className="mb-6">{host.bio}</p>}
          {stats && stats.listing_count > 1 && <p className="mb-6 text-muted">{firstName(host.name)} hosts {stats.listing_count} places on this site.</p>}
          <h3 className="mb-2 text-lg font-semibold">Host details</h3>
          <p className="mb-6">Response rate: 100%<br />Responds within an hour</p>
          <button onClick={() => toast.show("Messaging hosts is coming soon")} className="btn-dark">Message host</button>
          <p className="mt-6 flex items-center gap-3 border-t border-line pt-6 text-xs text-muted">
            <Icon name="shield" size={24} strokeWidth={1.5} className="shrink-0 text-rausch" />
            To help protect your payment, always use this site to send money and communicate with hosts. {plural(years, "year")} of verified hosting.
          </p>
        </div>
      </div>
    </section>
  );
}
