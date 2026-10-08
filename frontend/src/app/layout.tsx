import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { MobileNav } from "@/components/layout/MobileNav";
import { themeInitScript } from "@/context/ThemeContext";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Airbnb | Holiday rentals, cabins, beach houses & more",
  description: "Find a place to stay: browse homes, check availability and book your next trip.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FF385C" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>
        <Providers>
          {children}
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
