import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar, NavbarFallback } from "@/components/navbar";
import { Footer } from "@/components/footer";
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
              behind Suspense. The fallback is exported from navbar.tsx and is
              an exact copy of the navbar's first render, so hydration always
              matches. */}
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
