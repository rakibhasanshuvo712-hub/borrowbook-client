"use client"

import * as React from "react"

export type User = {
  name: string
  email: string
  photo?: string
}

export type Session = {
  user: User
  /** JWT from POST /jwt — sent as `Authorization: Bearer <token>`. */
  token: string
}

type AuthContextValue = {
  user: User | null
  token: string | null
  /**
   * False until the stored session (localStorage) has been read on the client.
   * Private routes must wait for this before deciding to redirect, otherwise
   * the first paint (signed out on the server) would bounce a logged-in user
   * to /login.
   */
  hydrated: boolean
  login: (user: User, token: string) => void
  /** Updates the stored user (e.g. after editing the profile); keeps the token. */
  updateUser: (user: User) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const STORAGE_KEY = "booknook.session"

function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session>
    if (!parsed?.user?.email || typeof parsed.token !== "string") return null
    return {
      user: {
        name: String(parsed.user.name ?? ""),
        email: String(parsed.user.email),
        photo: parsed.user.photo,
      },
      token: parsed.token,
    }
  } catch {
    return null
  }
}

/**
 * Session kept in localStorage: the server renders the signed-out UI, then the
 * stored session is restored in an effect after hydration (`hydrated` flag),
 * so server and client agree on the first paint.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    // Intentional one-time hydration from an external store (localStorage);
    // the signed-out server render is replaced here rather than during
    // hydration to keep server and client markup in sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(readSession())
    setHydrated(true)
  }, [])

  const login = React.useCallback((user: User, token: string) => {
    const next: Session = { user, token }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Private mode / quota — the session then lasts for this tab only.
    }
    setSession(next)
  }, [])

  const updateUser = React.useCallback((user: User) => {
    setSession((prev) => {
      if (!prev) return prev
      const next: Session = { ...prev, user }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Private mode / quota — the session then lasts for this tab only.
      }
      return next
    })
  }, [])

  const logout = React.useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore storage failures; state is cleared either way.
    }
    setSession(null)
  }, [])

  const value = React.useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      hydrated,
      login,
      updateUser,
      logout,
    }),
    [session, hydrated, login, updateUser, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>")
  return ctx
}
