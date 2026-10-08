import Link from "next/link";
import { BRAND_NAME } from "@/lib/format";

/** Brand lockup: a placeholder mark plus the "airbnb" name set in the brand colour. */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-1 text-rausch" aria-label={`${BRAND_NAME} home`}>
      <img src="/logo.png" alt="" className="h-10 w-auto" />
    </Link>
  );
}
