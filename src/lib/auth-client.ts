import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  // Auth is proxied through the current site so Better Auth cookies remain
  // first-party when the frontend and API use different Vercel domains.
  // Better Auth appends this base path to the current origin.
  baseURL: typeof window === "undefined" ? undefined : window.location.origin,
  basePath: "/api/auth",
  fetchOptions: { credentials: "include" },
})
