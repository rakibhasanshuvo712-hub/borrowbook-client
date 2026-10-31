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
    // The Express backend allows a fixed CORS origin list, so the browser
    // calls go through this same-origin proxy instead of hitting
    // localhost:5000 directly. Point NEXT_PUBLIC_SERVER_BASE_URL at
    // http://localhost:5000 (and set CLIENT_URL in the backend .env) if you
    // prefer talking to the API directly.
    //
    // Two sources are proxied to the same backend:
    //   /api/server/:path*  — the custom REST API (books, borrows, /jwt) and
    //                        the value of NEXT_PUBLIC_SERVER_BASE_URL.
    //   /api/auth/:path*    — Better Auth's default base path. The Better Auth
    //                        client resolves its base URL from
    //                        window.location.origin + "/api/auth", so it must
    //                        reach the backend's /api/auth/* routes here too.
    const target = process.env.SERVER_PROXY_TARGET || "http://localhost:5000";
    return [
      { source: "/api/server/:path*", destination: `${target}/:path*` },
      { source: "/api/auth/:path*", destination: `${target}/api/auth/:path*` },
    ];
  },
};

export default nextConfig;
