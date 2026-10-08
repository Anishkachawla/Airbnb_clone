import { Suspense } from "react";
import { HostDashboard } from "@/components/hosting/HostDashboard";

export default function HostingPage() {
  return (
    <Suspense>
      <HostDashboard />
    </Suspense>
  );
}
