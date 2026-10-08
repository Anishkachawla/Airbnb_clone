"use client";

import { useState } from "react";
import { StarSolid } from "./Icon";

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className={`transition ${n <= shown ? "text-ink" : "text-line"} hover:scale-110`}
        >
          <StarSolid size={32} />
        </button>
      ))}
    </div>
  );
}
