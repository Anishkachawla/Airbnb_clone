import { Suspense } from "react";
import { ListingPage } from "@/components/listing/ListingPage";

export default function RoomPage() {
  return (
    <Suspense>
      <ListingPage />
    </Suspense>
  );
}
