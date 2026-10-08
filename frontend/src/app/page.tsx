import { Suspense } from "react";
import { ExploreFallback, ExplorePage } from "@/components/explore/ExplorePage";

export default function Home() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExplorePage />
    </Suspense>
  );
}
