"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CircleCheckIcon,
  CircleIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { cn } from "cn"
import { useAuth } from "@/lib/auth-context"
import {
  loginWithGoogle,
  passwordErrorMessage,
  passwordRules,
  registerUser,
} from "@/lib/auth"
import { GoogleIcon } from "@/components/brand-icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { toast } from "@/components/ui/toast"

const initialForm = {
  name: "",
  email: "",
  photo: "",
  password: "",
}

export default function RegisterPage() {
  const { login, user } = useAuth()
  const router = useRouter()

  const [form, setForm] = React.useState(initialForm)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [touchedPassword, setTouchedPassword] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [googlePending, setGooglePending] = React.useState(false)
  const [photoFailed, setPhotoFailed] = React.useState(false)

  React.useEffect(() => {
    if (user) router.replace("/")
  }, [user, router])

  function update<Key extends keyof typeof initialForm>(
    key: Key,
    value: (typeof initialForm)[Key]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Clear the form-level error as soon as the user edits something.
    setFormError(null)
    if (key === "photo") setPhotoFailed(false)
  }

  /** Live error only after the user leaves the field or tried to submit. */
  const passwordError = touchedPassword
    ? passwordErrorMessage(form.password)
    : null

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouchedPassword(true)

    // Client-side password validation — never send an invalid password.
    const invalidPassword = passwordErrorMessage(form.password)
    if (invalidPassword) {
      setFormError(invalidPassword)
      toast.add({
        type: "error",
        title: "Invalid password",
        description: invalidPassword,
      })
      return
    }

    const photo = form.photo.trim()
    if (photo !== "" && !/^https?:\/\/\S/.test(photo) && !photo.startsWith("/")) {
      const message = "Enter a valid photo URL, such as https://… or /avatar.svg."
      setFormError(message)
      toast.add({ type: "error", title: "Invalid photo URL", description: message })
      return
    }

    setSubmitting(true)
    const result = await registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      photo: photo || "/avatar.svg",
      password: form.password,
    })
    setSubmitting(false)

    if (!result.ok) {
      setFormError(result.error)
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
      description: "Welcome to BookNook! Please log in to continue.",
    })
    router.push("/login")
  }

  async function handleGoogleLogin() {
    setFormError(null)
    setGooglePending(true)
    const result = await loginWithGoogle()
    setGooglePending(false)

    if (!result.ok) {
      setFormError(result.error)
      toast.add({
        type: "error",
        title: "Google sign-in failed",
        description: result.error,
      })
      return
    }

    login(result.user)
    toast.add({
      type: "success",
      title: "Signed in with Google",
      description: `Welcome, ${result.user.name}!`,
    })
    router.push("/")
  }

  const previewSrc = form.photo.trim()
  const showPreview = previewSrc !== "" && !photoFailed

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
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <TriangleAlertIcon />
              <AlertTitle>Could not register</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

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
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
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
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="register-photo">Photo URL</Label>
              <div className="flex items-center gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                  {showPreview ? (
                    <Image
                      src={previewSrc}
                      alt="Profile photo preview"
                      fill
                      sizes="40px"
                      unoptimized
                      className="object-cover"
                      onError={() => setPhotoFailed(true)}
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                      <CircleIcon className="size-5" />
                    </span>
                  )}
                </div>
                <Input
                  id="register-photo"
                  name="photo"
                  type="text"
                  autoComplete="url"
                  className="min-w-0 flex-1"
                  placeholder="https://… (optional)"
                  value={form.photo}
                  onChange={(event) => update("photo", event.target.value)}
                />
              </div>
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
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                onBlur={() => setTouchedPassword(true)}
              />

              <ul
                id="register-password-rules"
                className="flex flex-col gap-1 text-xs"
              >
                {passwordRules.map((rule) => {
                  const satisfied = rule.test(form.password)
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

          <div className="relative my-4 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={googlePending}
            onClick={handleGoogleLogin}
            className="w-full"
          >
            {googlePending ? (
              <>
                <Spinner />
                Signing in…
              </>
            ) : (
              <>
                <GoogleIcon className="size-4" />
                Continue with Google
              </>
            )}
          </Button>

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
