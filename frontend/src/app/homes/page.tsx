import { Suspense } from "react";
import { ExploreFallback, ExplorePage } from "@/components/explore/ExplorePage";

/** "Homes" tab: the same stays explorer as "All" (experiences and services aren't built yet). */
export default function HomesPage() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExplorePage />
    </Suspense>
  );
}
