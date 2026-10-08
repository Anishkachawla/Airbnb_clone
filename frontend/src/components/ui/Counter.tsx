import { Icon } from "./Icon";

interface CounterProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** The round −/+ stepper used for guests, bedrooms, etc. */
export function Counter({ label, hint, value, onChange, min = 0, max = 16, step = 1 }: CounterProps) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full border border-muted/60 text-muted transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:border-line disabled:text-line";
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <div className="font-semibold">{label}</div>
        {hint && <div className="text-sm text-muted">{hint}</div>}
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} aria-label={`Decrease ${label}`}>
          <Icon name="minus" size={14} strokeWidth={2.5} />
        </button>
        <span className="w-6 text-center tabular-nums" aria-live="polite">{value}{value >= max && max > 8 ? "+" : ""}</span>
        <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} aria-label={`Increase ${label}`}>
          <Icon name="plus" size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
