"use client";

import { useParams } from "next/navigation";
import { ListingWizard } from "@/components/hosting/ListingWizard";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  return <ListingWizard listingId={Number(id)} />;
}
