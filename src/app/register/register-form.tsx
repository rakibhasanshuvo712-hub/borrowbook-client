"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CircleCheckIcon, CircleIcon } from "lucide-react"
import { cn } from "cn"
import {
  passwordErrorMessage,
  passwordRules,
  registerAccount,
} from "@/lib/auth"
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
 * Creates an account in the local account store (`@/lib/auth`), then sends
 * the visitor to /login — the backend only exchanges an email for a token,
 * so the password check happens here.
 */
export function RegisterForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)
  const [touchedPassword, setTouchedPassword] = React.useState(false)
  const [password, setPassword] = React.useState("")

  React.useEffect(() => {
    if (user) router.replace("/")
  }, [user, router])

  // Live error only after the user leaves the field or tried to submit.
  const passwordError = touchedPassword ? passwordErrorMessage(password) : null

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setTouchedPassword(true)

    const form = new FormData(event.currentTarget)
    const data = Object.fromEntries(form.entries())
    const name = String(data.name ?? "").trim()
    const email = String(data.email ?? "").trim()
    const enteredPassword = String(data.password ?? "")

    // Client-side password validation — never submit an invalid password.
    const invalidPassword = passwordErrorMessage(enteredPassword)
    if (invalidPassword) {
      toast.add({
        type: "error",
        title: "Invalid password",
        description: invalidPassword,
      })
      return
    }

    setSubmitting(true)
    try {
      const result = await registerAccount({
        name,
        email,
        password: enteredPassword,
      })

      if (!result.ok) {
        toast.add({
          type: "error",
          title: "Registration failed",
          description: result.error,
        })
        return
      }

      toast.add({
        type: "success",
        title: "Account created",
        description: `Welcome to BookNook, ${result.user.name}! Sign in to continue.`,
      })
      router.push("/login")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Create your account</CardTitle>
          <CardDescription>
            Join BookNook to borrow, share, and track books.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-name">Name</Label>
              <Input
                id="register-name"
                name="name"
                type="text"
                placeholder="Jane Reader"
                autoComplete="name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                aria-invalid={passwordError ? true : undefined}
                aria-describedby="register-password-rules"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => setTouchedPassword(true)}
              />

              <ul
                id="register-password-rules"
                className="flex flex-col gap-1 text-xs"
              >
                {passwordRules.map((rule) => {
                  const satisfied = rule.test(password)
                  return (
                    <li
                      key={rule.label}
                      className={cn(
                        "flex items-center gap-1.5",
                        satisfied
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {satisfied ? (
                        <CircleCheckIcon className="size-3.5" />
                      ) : (
                        <CircleIcon className="size-3.5" />
                      )}
                      {rule.label}
                    </li>
                  )
                })}
              </ul>

              {passwordError && (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {passwordError}
                </p>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Spinner />
                  Registering…
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
