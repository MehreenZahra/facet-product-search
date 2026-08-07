import type { Metadata } from "next";
import "./globals.css";
import DarkModeToggle from "../components/DarkModeToggle";

export const metadata: Metadata = {
  title: "HealthCatalog — Healf Product Search",
  description: "Search 4,600+ health & wellness products from the Healf catalogue.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-[100dvh] flex flex-col bg-background text-foreground antialiased">
        {/* ── Top nav ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group outline-none">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-sm">
                {/* Lucide Pill icon (inline SVG so no import needed in server component) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                  <path d="M8.5 8.5 16 16" />
                </svg>
              </div>
              <span className="font-display font-semibold tracking-tight text-lg group-hover:text-primary transition-colors">
                HealthCatalog
              </span>
            </a>

            {/* Right nav */}
            <DarkModeToggle />
          </div>
        </header>

        {/* ── Stats strip ─────────────────────────────────────────────────── */}
        <div className="bg-secondary/40 border-b border-border py-2.5 px-4 text-sm text-muted-foreground">
          <div className="container mx-auto flex flex-wrap gap-x-6 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              <strong className="text-foreground font-semibold">4,587</strong>
              <span>products</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"/></svg>
              <strong className="text-foreground font-semibold">437</strong>
              <span>brands</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
              <strong className="text-foreground font-semibold">10</strong>
              <span>categories</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>Avg price</span>
              <strong className="text-foreground font-semibold">£42.50</strong>
            </span>
          </div>
        </div>

        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
