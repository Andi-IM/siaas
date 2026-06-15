import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Logo } from "@/components/logo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SIAAS — Student Academic Administration Information System",
  description:
    "Internal administrative system for managing student academic records, grades, attendance, and transcripts.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="main-area">
            <header className="topbar no-print">
              <div className="topbar-left">
                <Logo variant="full" theme="light" height={32} />
              </div>
              <div className="topbar-right">
                <label htmlFor="global-search" className="sr-only">Cari siswa, kelas</label>
                <input
                  id="global-search"
                  type="search"
                  placeholder="Cari siswa, kelas..."
                  className="search-input"
                />
                <div className="avatar" title="Admin" aria-hidden="true">A</div>
              </div>
            </header>

            <main className="content" id="main-content">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
