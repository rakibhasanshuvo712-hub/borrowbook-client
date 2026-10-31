"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpenIcon, CircleCheckIcon, CircleIcon, SparklesIcon } from "lucide-react"
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
 * Creates an account via Better Auth, then immediately exchanges the session
 * cookie for the API JWT and signs the user in (see `registerAccount`), so
 * they land on the homepage with a profile ready to edit — no /login step.
 */
export function RegisterForm() {
  const { user, login } = useAuth()
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

      // The account is created and the session cookie is set — exchange it
      // for the API JWT (already done inside registerAccount) and sign in,
      // so the user lands on the homepage with a profile ready to edit.
      login(
        { name: result.user.name, email: result.user.email },
        result.token
      )
      toast.add({
        type: "success",
        title: "Account created",
        description: `Welcome to BookNook, ${result.user.name}!`,
      })
      router.push("/")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-100 via-background to-amber-100 px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-orange-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-24 size-72 rounded-full bg-teal-300/25 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-card shadow-2xl shadow-emerald-950/10 ring-1 ring-emerald-900/10 md:grid-cols-2">
        <Card className="order-2 w-full max-w-sm justify-self-center self-center bg-transparent py-0 ring-0 shadow-none md:order-1">
        <CardHeader className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-rose-500 px-6 py-6 text-white sm:px-8">
          <CardTitle className="text-xl font-semibold">Create your account</CardTitle>
          <CardDescription className="text-white/85">
            Join BookNook to borrow, share, and track books.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-7 sm:px-8">
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
        <aside className="relative order-1 hidden min-h-[700px] flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-rose-500 p-10 text-white md:order-2 md:flex">
          <div className="absolute -top-20 -right-20 size-72 rounded-full border-[36px] border-white/10" />
          <div className="absolute -bottom-12 -left-12 size-56 rounded-full border border-white/20" />
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <BookOpenIcon className="size-7" />
          </div>
          <div className="relative max-w-sm">
            <SparklesIcon className="mb-5 size-6 text-amber-200" />
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">Your next chapter starts here.</h1>
            <p className="mt-4 text-base leading-relaxed text-white/85">Make a colourful little corner for the books you love and the stories you have yet to discover.</p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20">Discover</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20">Borrow</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20">Share</span>
            </div>
          </div>
          <p className="relative text-sm text-white/75">A welcoming shelf for every kind of reader.</p>
        </aside>
      </div>
    </div>
  )
}
