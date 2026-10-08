/** Airbnb's three pulsing dots. */
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} role="status" aria-label="Loading">
      {[0, 160, 320].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
