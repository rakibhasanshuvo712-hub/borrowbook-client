import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookNook",
  description:
    "BookNook is a cozy online library where readers discover, borrow, and share books with their community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {/* The navbar reads the pathname for active-link styling, which is
              URL data: routes with dynamic params (e.g. /books/[id]) resolve it
              behind Suspense, with a same-shape header as the fallback. */}
          <Suspense fallback={<NavbarFallback />}>
            <Navbar />
          </Suspense>
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </AuthProvider>
        {/* Toast viewport for the shared `toast` manager (registration,
            borrowed books, etc.). */}
        <Toaster />
      </body>
    </html>
  );
}

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-teal-900/20 bg-teal-700/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-x-6 px-4 py-3 sm:px-6">
        <Logo className="text-white" />
        <span className="h-7 w-32 rounded-md bg-white/20" aria-hidden="true" />
      </div>
    </header>
  );
}
