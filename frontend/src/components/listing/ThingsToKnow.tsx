import { addDays, fmt, fromISO, toISO, today } from "@/lib/dates";

export function ThingsToKnow({ maxGuests, checkIn }: { maxGuests: number; checkIn: string | null }) {
  const freeUntil = checkIn ? fmt.short(toISO(addDays(fromISO(checkIn), -7))) : null;
  const cols = [
    { title: "House rules", items: ["Check-in after 3:00 PM", "Checkout before 11:00 AM", `${maxGuests} guests maximum`] },
    { title: "Safety & property", items: ["Smoke alarm", "Carbon monoxide alarm not reported", "Pool/hot tub without a gate or lock where applicable"] },
    {
      title: "Cancellation policy",
      items: [
        freeUntil ? `Free cancellation before ${freeUntil}.` : `Free cancellation until 7 days before check-in (e.g. book for ${fmt.short(toISO(addDays(today(), 30)))}).`,
        "Cancel from your Trips page any time before check-in.",
      ],
    },
  ];
  return (
    <section className="py-12">
      <h2 className="mb-6 text-[22px] font-semibold">Things to know</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="mb-3 font-semibold">{c.title}</h3>
            <ul className="space-y-3">{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}
