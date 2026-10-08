import { BRAND_NAME } from "@/lib/format";

const COLUMNS = [
  { title: "Support", links: ["Help Center", "Safety information", "Cancellation options", "Report a concern"] },
  { title: "Hosting", links: ["Airbnb your home", "Hosting resources", "Community forum", "Hosting responsibly"] },
  { title: "Airbnb", links: ["Newsroom", "Careers", "Investors", "Gift cards"] },
];

export function Footer({ narrow = false }: { narrow?: boolean }) {
  return (
    <footer className="mt-16 border-t border-line bg-soft pb-24 md:pb-0">
      <div className={`mx-auto px-6 py-12 ${narrow ? "max-w-detail lg:px-10" : "max-w-page xl:px-10 2xl:px-20"}`}>
        <div className="grid gap-8 md:grid-cols-3">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="mb-3 text-sm font-semibold capitalize">{c.title}</h3>
              <ul className="space-y-3 text-sm text-muted">
                {c.links.map((l) => <li key={l}><span className="cursor-default hover:underline">{l}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-line pt-6 text-sm text-muted md:flex-row">
          <span>© {new Date().getFullYear()} {BRAND_NAME} clone · Demo project, not affiliated with Airbnb, Inc.</span>
          <span className="font-semibold text-ink">English (IN) · ₹ INR</span>
        </div>
      </div>
    </footer>
  );
}
