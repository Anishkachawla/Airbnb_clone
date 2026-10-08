import { Suspense } from "react";
import { CheckoutPage } from "@/components/booking/CheckoutPage";

export default function BookPage() {
  return (
    <Suspense>
      <CheckoutPage />
    </Suspense>
  );
}
