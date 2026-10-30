import type { User } from "@/lib/auth-context"

export type RegisterInput = {
  name: string
  email: string
  photo: string
  password: string
}

export type RegisterResult = { ok: true } | { ok: false; error: string }

export type GoogleLoginResult =
  | { ok: true; user: User }
  | { ok: false; error: string }

/**
 * Password rules for registration. Each rule carries the label shown in the
 * live checklist and a short hint used to build the error sentence, so the
 * form and the validation can never drift apart.
 */
export const passwordRules = [
  {
    label: "Uppercase letter",
    hint: "an uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "Lowercase letter",
    hint: "a lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "At least 6 characters",
    hint: "a minimum length of 6 characters",
    test: (value: string) => value.length >= 6,
  },
] as const

/** Failing rules for the given password (empty array means valid). */
export function passwordErrors(password: string) {
  return passwordRules.filter((rule) => !rule.test(password))
}

/** Human-readable sentence for the failing rules, or null when valid. */
export function passwordErrorMessage(password: string): string | null {
  const problems = passwordErrors(password)
  if (problems.length === 0) return null
  return `Password must have ${problems.map((rule) => rule.hint).join(", ")}.`
}

function readApiError(payload: unknown, status: number): string {
  const fallback = `The server rejected the registration (status ${status}).`
  if (typeof payload !== "object" || payload === null) return fallback
  const { message, error } = payload as { message?: unknown; error?: unknown }
  if (typeof message === "string" && message.trim()) return message
  if (typeof error === "string" && error.trim()) return error
  return fallback
}

/**
 * Submits a new account to the backend (POST /register — adjust the path to
 * match your server's route). With no NEXT_PUBLIC_SERVER_URL configured there
 * is no backend yet, so the registration is accepted in demo mode to keep the
 * flow testable, mirroring addBook in books.ts.
 */
export async function registerUser(
  input: RegisterInput
): Promise<RegisterResult> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL
  if (!baseUrl) return { ok: true }

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      let payload: unknown = null
      try {
        payload = await res.json()
      } catch {
        // Non-JSON error body — fall back to the status message.
      }
      return { ok: false, error: readApiError(payload, res.status) }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: "Could not reach the server. Please try again." }
  }
}

/**
 * Mock Google round-trip so the social-login flow is testable without OAuth
 * credentials. Swap the body for Firebase `signInWithPopup` (or your backend's
 * Google OAuth redirect/exchange) once a provider is configured — the caller
 * only depends on the returned user shape.
 */
export async function loginWithGoogle(): Promise<GoogleLoginResult> {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return {
    ok: true,
    user: {
      name: "Google Reader",
      email: "reader@gmail.com",
      photo: "/avatar.svg",
    },
  }
}
