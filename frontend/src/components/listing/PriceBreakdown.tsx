import { plural, price } from "@/lib/format";
import type { Quote } from "@/lib/types";

export function PriceBreakdown({ quote, totalLabel = "Total before taxes" }: { quote: Quote; totalLabel?: string }) {
  const row = "flex justify-between";
  return (
    <div className="space-y-3">
      <div className={row}>
        <span className="underline">{price(quote.nightly_rate)} x {plural(quote.nights, "night")}</span>
        <span>{price(quote.subtotal)}</span>
      </div>
      {quote.cleaning_fee > 0 && (
        <div className={row}><span className="underline">Cleaning fee</span><span>{price(quote.cleaning_fee)}</span></div>
      )}
      <div className={row}><span className="underline">Airbnb service fee</span><span>{price(quote.service_fee)}</span></div>
      <hr className="border-line !my-6" />
      <div className={`${row} font-semibold`}><span>{totalLabel}</span><span>{price(quote.total)}</span></div>
    </div>
  );
}
