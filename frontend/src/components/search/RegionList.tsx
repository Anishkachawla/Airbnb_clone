import { Icon } from "@/components/ui/Icon";
import { REGIONS } from "@/lib/constants";

export function RegionList({ query, onPick }: { query: string; onPick: (region: string) => void }) {
  const q = query.trim().toLowerCase();
  const matches = q ? REGIONS.filter((r) => r.label.toLowerCase().includes(q)) : REGIONS;
  return (
    <div>
      <p className="px-4 pb-2 text-xs font-semibold text-muted">{q ? "Suggestions" : "Suggested destinations"}</p>
      <ul>
        {q && !matches.some((m) => m.label.toLowerCase() === q) && (
          <li>
            <button type="button" onClick={() => onPick(query.trim())} className="flex w-full items-center gap-4 rounded-xl px-4 py-2 text-left hover:bg-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft"><Icon name="search" size={20} /></span>
              <span>Search for “{query.trim()}”</span>
            </button>
          </li>
        )}
        {matches.map((r) => (
          <li key={r.label}>
            <button type="button" onClick={() => onPick(r.label)} className="flex w-full items-center gap-4 rounded-xl px-4 py-2 text-left hover:bg-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft"><Icon name="pin" size={20} strokeWidth={1.6} /></span>
              <span>
                <span className="block">{r.label}</span>
                <span className="block text-sm text-muted">{r.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
