import { createAuthClient } from "better-auth/react"

/**
 * Better Auth client for the Express backend.
 *
 * No `baseURL` is passed: Better Auth resolves it to
 * `window.location.origin + "/api/auth"` in the browser, and the
 * `/api/auth/:path*` rewrite in `next.config.ts` forwards those calls to
 * the backend's Better Auth routes. Because the browser only ever talks to
 * the Next.js origin, the session cookie Better Auth sets is first-party —
 * no CORS, no SameSite problems.
 *
 * The custom REST API (books, borrows, /jwt) still goes through the separate
 * `/api/server` proxy via `@/lib/api` and `NEXT_PUBLIC_SERVER_BASE_URL`.
 */
export const authClient = createAuthClient()
