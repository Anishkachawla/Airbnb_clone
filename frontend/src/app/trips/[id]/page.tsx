import { Suspense } from "react";
import { TripDetail } from "@/components/booking/TripDetail";

export default function TripPage() {
  return (
    <Suspense>
      <TripDetail />
    </Suspense>
  );
}
