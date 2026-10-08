import { Counter } from "@/components/ui/Counter";
import type { GuestCounts } from "@/lib/searchParams";

/** Adults / Children / Infants / Pets steppers, shared by the search bar, booking card and checkout. */
interface Props {
  value: GuestCounts;
  onChange: (g: GuestCounts) => void;
  maxGuests?: number;
  /** 1 when booking (a stay needs a guest); 0 in search, where "no guests" means "any". */
  minAdults?: number;
}

export function GuestCounters({ value, onChange, maxGuests = 16, minAdults = 0 }: Props) {
  const seated = value.adults + value.children;
  const set = (key: keyof GuestCounts) => (n: number) => {
    const next = { ...value, [key]: n };
    // Adding children/infants/pets implies at least one adult, as on Airbnb
    if (key !== "adults" && n > 0 && next.adults === 0) next.adults = 1;
    onChange(next);
  };
  return (
    <div className="divide-y divide-line">
      <Counter label="Adults" hint="Ages 13 or above" value={value.adults} onChange={set("adults")}
        min={Math.max(minAdults, value.children || value.infants || value.pets ? 1 : 0)} max={value.adults + (maxGuests - seated)} />
      <Counter label="Children" hint="Ages 2–12" value={value.children} onChange={set("children")} max={value.children + (maxGuests - seated)} />
      <Counter label="Infants" hint="Under 2" value={value.infants} onChange={set("infants")} max={5} />
      <Counter label="Pets" hint="Bringing a service animal?" value={value.pets} onChange={set("pets")} max={5} />
    </div>
  );
}
