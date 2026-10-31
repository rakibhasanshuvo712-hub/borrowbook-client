/**
 * Password rules shared by the register form's live checklist, plus the
 * client-side sign-up call.
 *
 * Accounts themselves live on the server: Better Auth (on the Express
 * backend) stores users and scrypt-hashed passwords in MongoDB, and the
 * backend enforces the same minimum length (`minPasswordLength: 6` in
 * index.js) — these rules are the friendly client-side mirror of that.
 *
 * Registration goes through Better Auth (POST /api/auth/sign-up/email,
 * called directly on the backend). A successful sign-up leaves a session
 * cookie, which is then exchanged for the JWT (POST /jwt) used on private
 * routes — so the visitor is signed in immediately and sent to the
 * homepage rather than bounced through /login.
 */

import { authClient } from "@/lib/auth-client"
import { issueToken } from "@/lib/api"

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

export type RegisterInput = {
  name: string
  email: string
  password: string
}

export type RegisterResult =
  | { ok: true; user: { name: string; email: string }; token: string }
  | { ok: false; error: string }

/**
 * Creates an account via Better Auth (POST /api/auth/sign-up/email,
 * called directly on the backend). A successful sign-up sets the session
 * cookie, which is then exchanged for the JWT (POST /jwt) so the caller is
 * signed in immediately — no separate /login step.
 */
export async function registerAccount(input: RegisterInput): Promise<RegisterResult> {
  try {
    const { data, error } = await authClient.signUp.email({
      name: input.name,
      email: input.email,
      password: input.password,
    })
    if (error) {
      return { ok: false, error: error.message ?? "Could not create your account." }
    }
    try {
      const token = await issueToken()
      return {
        ok: true,
        token,
        user: {
          name: data?.user.name ?? input.name,
          email: data?.user.email ?? input.email,
        },
      }
    } catch (err: unknown) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? `Account created, but sign-in failed: ${err.message}`
            : "Account created, but sign-in failed.",
      }
    }
  } catch (err: unknown) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Registration failed: ${err.message}`
          : "Registration failed. The backend may be unreachable.",
    }
  }
}
