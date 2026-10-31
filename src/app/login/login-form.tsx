"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpenIcon, SparklesIcon } from "lucide-react"
import { issueToken } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

/**
 * Email + password are verified server-side by Better Auth (POST
 * /api/auth/sign-in/email, called directly on the backend). A successful
 * sign-in leaves a session cookie on the backend, which is then exchanged
 * for the JWT
 * (POST /jwt) used as `Authorization: Bearer …` on every private route.
 */
export function LoginForm() {
  const { login, user } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)

  function destination() {
    const requested = new URLSearchParams(window.location.search).get("next")
    return requested?.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/"
  }

  React.useEffect(() => {
    if (user) {
      const requested = new URLSearchParams(window.location.search).get("next")
      const next = requested?.startsWith("/") && !requested.startsWith("//")
        ? requested
        : "/"
      router.replace(next)
    }
  }, [user, router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const form = new FormData(event.currentTarget)
    const data = Object.fromEntries(form.entries())
    const email = String(data.email ?? "").trim()
    const password = String(data.password ?? "")

    if (!email || !password) {
      toast.add({
        type: "error",
        title: "Missing details",
        description: "Please enter your email and password.",
      })
      return
    }

    setSubmitting(true)
    try {
      const { data, error } = await authClient.signIn.email({ email, password })
      if (error) {
        toast.add({
          type: "error",
          title: "Could not sign in",
          description: error.message ?? "Check your email and password.",
        })
        return
      }

      // The session cookie is set — exchange it for the API JWT.
      const token = await issueToken()
      login(
        {
          name: data?.user.name || email,
          email: data?.user.email || email,
          photo: data?.user.image ?? undefined,
        },
        token
      )
      toast.add({
        type: "success",
        title: "Signed in",
        description: `Welcome back, ${data?.user.name || email}!`,
      })
      router.push(destination())
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Could not sign in",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-100 via-background to-emerald-100 px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-lime-300/30 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-card shadow-2xl shadow-teal-950/10 ring-1 ring-teal-900/10 md:grid-cols-2">
        <aside className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-800 via-emerald-700 to-lime-600 p-10 text-white md:flex">
          <div className="absolute -right-16 -bottom-20 size-72 rounded-full border-[36px] border-white/10" />
          <div className="absolute top-28 -right-8 size-44 rounded-full border border-white/20" />
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <BookOpenIcon className="size-7" />
          </div>
          <div className="relative max-w-sm">
            <SparklesIcon className="mb-5 size-6 text-amber-200" />
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">A little more wonder on your shelf.</h1>
            <p className="mt-4 text-base leading-relaxed text-white/80">Find your next favourite, share a story with your neighbours, and pick up right where you left off.</p>
          </div>
          <p className="relative text-sm text-white/70">Good stories travel further together.</p>
        </aside>
        <Card className="w-full max-w-sm justify-self-center self-center bg-transparent py-0 ring-0 shadow-none">
        <CardHeader className="bg-gradient-to-r from-teal-800 to-emerald-600 px-6 py-6 text-white sm:px-8">
          <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
          <CardDescription className="text-white/80">
            Sign in to borrow books and manage your shelf.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-7 sm:px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Spinner />
                  Signing in…
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Register
            </Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
