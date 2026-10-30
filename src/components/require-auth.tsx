"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Spinner } from "@/components/ui/spinner"

/** Redirects to /login when no session is present; renders children once signed in. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!user) router.replace("/login")
  }, [user, router])

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
