"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
 * /api/auth/sign-in/email through the proxy). A successful sign-in leaves a
 * session cookie on the backend, which is then exchanged for the JWT
 * (POST /jwt) used as `Authorization: Bearer …` on every private route.
 */
export function LoginForm() {
  const { login, user } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (user) router.replace("/")
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
      router.push("/")
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
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Welcome back</CardTitle>
          <CardDescription>
            Sign in to borrow books and manage your shelf.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
  )
}
