"use client"

import * as React from "react"

export type User = {
  name: string
  email: string
  photo?: string
}

type AuthContextValue = {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

/**
 * Mock session kept in memory: state only changes inside event handlers
 * (login/logout), so server and client render the same signed-out UI on the
 * first paint. Replace with a real auth provider (cookie/JWT backed) when a
 * backend exists — persistence across reloads is intentionally not faked here.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)

  const login = React.useCallback((next: User) => setUser(next), [])
  const logout = React.useCallback(() => setUser(null), [])

  const value = React.useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>")
  return ctx
}
