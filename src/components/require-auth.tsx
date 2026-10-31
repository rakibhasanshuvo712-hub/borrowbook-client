"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Spinner } from "@/components/ui/spinner"

/**
 * Redirects to /login when no session is present; renders children once signed
 * in. Waits for localStorage hydration so a signed-in user refreshing a private
 * page never flashes through the login redirect.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (hydrated && !user) {
      const next = pathname || "/"
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [hydrated, user, router, pathname])

  if (!hydrated || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
