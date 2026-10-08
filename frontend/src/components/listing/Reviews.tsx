"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { StarSolid } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { fmt, yearsSince } from "@/lib/dates";
import { isGuestFavorite, plural, rating } from "@/lib/format";
import type { Review } from "@/lib/types";

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <StarSolid key={n} size={9} className={n <= value ? "" : "opacity-20"} />)}
    </span>
  );
}

function ReviewItem({ review, clamp }: { review: Review; clamp?: boolean }) {
  return (
    <article>
      <div className="mb-2 flex items-center gap-3">
        <Avatar name={review.author.name} src={review.author.avatar_url} size={48} />
        <div>
          <h3 className="font-semibold">{review.author.name.split(" ")[0]}</h3>
          <p className="text-sm text-muted">{plural(yearsSince(review.author.created_at), "year")} on the platform</p>
        </div>
      </div>
      <div className="mb-1 flex items-center gap-2 text-sm">
        <Stars value={review.rating} />
        <span className="font-semibold">·</span>
        <span className="font-semibold">{fmt.monthYear(review.created_at)}</span>
      </div>
      <p className={clamp ? "line-clamp-3" : ""}>{review.comment}</p>
    </article>
  );
}

export function Reviews({ reviews, avg, count }: { reviews: Review[]; avg: number | null; count: number }) {
  const [open, setOpen] = useState(false);

  if (!count) {
    return (
      <section className="border-b border-line py-12">
        <h2 className="flex items-center gap-2 text-[22px] font-semibold"><StarSolid size={18} /> No reviews (yet)</h2>
        <p className="mt-2 text-muted">This host has a new listing. Be one of the first guests to stay and share your experience.</p>
      </section>
    );
  }

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({ stars, n: reviews.filter((r) => r.rating === stars).length }));
  const favorite = isGuestFavorite(avg, count);

  return (
    <section className="border-b border-line py-12" id="reviews">
      {favorite ? (
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <Laurel />
            <span className="text-[80px] font-semibold leading-none tracking-tight">{rating(avg)}</span>
            <Laurel flip />
          </div>
          <h2 className="mt-2 text-[22px] font-semibold">Guest favourite</h2>
          <p className="max-w-[300px] text-muted">One of the most loved homes, based on ratings, reviews, and reliability</p>
        </div>
      ) : (
        <h2 className="mb-8 flex items-center gap-2 text-[22px] font-semibold"><StarSolid size={18} /> {rating(avg)} · {plural(count, "review")}</h2>
      )}

      <div className="mb-10 max-w-[260px] space-y-1">
        <p className="mb-2 text-sm font-semibold">Overall rating</p>
        {distribution.map((d) => (
          <div key={d.stars} className="flex items-center gap-3 text-xs">
            <span className="w-2">{d.stars}</span>
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-line">
              <span className="block h-full rounded-full bg-ink" style={{ width: `${(d.n / count) * 100}%` }} />
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-x-24 gap-y-10 md:grid-cols-2">
        {reviews.slice(0, 6).map((r) => <ReviewItem key={r.id} review={r} clamp />)}
      </div>
      {count > 6 && <button onClick={() => setOpen(true)} className="btn-outline mt-10">Show all {count} reviews</button>}

      <Modal open={open} onClose={() => setOpen(false)} width="max-w-[1032px]">
        <div className="px-6 pb-10 pt-2 md:px-10">
          <h2 className="mb-8 flex items-center gap-2 text-[26px] font-semibold"><StarSolid size={20} /> {rating(avg)} · {plural(count, "review")}</h2>
          <div className="space-y-10">{reviews.map((r) => <ReviewItem key={r.id} review={r} />)}</div>
        </div>
      </Modal>
    </section>
  );
}

/** Decorative laurel branch for the "Guest favourite" rating. */
export function Laurel({ flip, size = 52 }: { flip?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 20 32" width={size * 0.62} height={size} aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <g fill="currentColor">
        <path d="M15.5 30C8 27 4 20 4.5 11c.2 9 4 14.5 11.5 17.5z" />
        <ellipse cx="4.5" cy="9" rx="1.6" ry="3.4" transform="rotate(-10 4.5 9)" />
        <ellipse cx="3.5" cy="15" rx="1.5" ry="3.2" transform="rotate(-40 3.5 15)" />
        <ellipse cx="5" cy="21" rx="1.5" ry="3.2" transform="rotate(-60 5 21)" />
        <ellipse cx="8.5" cy="26" rx="1.4" ry="3" transform="rotate(-75 8.5 26)" />
      </g>
    </svg>
  );
}
