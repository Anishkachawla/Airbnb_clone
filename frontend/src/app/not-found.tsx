import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default function NotFound() {
  return (
    <>
      <Header variant="detail" />
      <main className="mx-auto flex max-w-detail flex-col items-start gap-4 px-6 py-24 lg:px-10">
        <p className="text-[120px] font-bold leading-none text-line">404</p>
        <h1 className="text-[32px] font-semibold">We can&apos;t seem to find the page you&apos;re looking for.</h1>
        <Link href="/" className="btn-dark">Go home</Link>
      </main>
    </>
  );
}
