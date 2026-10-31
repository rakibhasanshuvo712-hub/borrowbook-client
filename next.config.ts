import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    // Keep auth cookies first-party by proxying both API paths through Next.
    // SERVER_API_URL is set separately for local development and each Vercel
    // environment; it is never compiled into browser JavaScript.
    // Keep the existing public URL as a fallback for deployments that have
    // already configured it; new deployments should use SERVER_API_URL.
    const target = (process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL)
      ?.replace(/\/+$/, "");
    if (!target) return [];

    return [
      { source: "/api/server/:path*", destination: `${target}/:path*` },
      { source: "/api/auth/:path*", destination: `${target}/api/auth/:path*` },
    ];
  },
};

export default nextConfig;
