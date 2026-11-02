"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOutIcon, UserIcon, UserRoundIcon } from "lucide-react"
import { cn } from "cn"
import { useAuth, type User } from "@/lib/auth-context"
import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "All Books" },
] as const

const privateLinks = [
  { href: "/add-book", label: "Add Book" },
  { href: "/my-books", label: "My Books" },
  { href: "/my-borrows", label: "My Borrows" },
] as const

const HEADER_CLASS = "sticky top-0 z-40 border-b border-amber-200/20 bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 shadow-lg shadow-teal-950/10 backdrop-blur"
const INNER_CLASS =
  "mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6"
const LOGIN_CLASS = buttonVariants({
  variant: "outline",
  size: "sm",
  className: "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
})
const REGISTER_CLASS = buttonVariants({
  variant: "default",
  size: "sm",
  className: "bg-[#d69b64] text-[#1b3033] shadow-md shadow-black/15 hover:bg-[#e4b27e]",
})

function isActive(pathname: string | null, href: string) {
  if (pathname == null) return false
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

type NavLink = { href: string; label: string }

/**
 * The nav markup is shared by `Navbar` and `NavbarFallback` so the Suspense
 * fallback can never drift from the real header.
 */
function NavLinks({
  links,
  pathname,
}: {
  links: readonly NavLink[]
  /** `null` before hydration — no link is highlighted yet. */
  pathname: string | null
}) {
  return (
    <nav
      aria-label="Main navigation"
      className="order-last flex w-full flex-wrap items-center gap-1 sm:order-none sm:w-auto"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(pathname, link.href) ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            isActive(pathname, link.href)
              ? "bg-amber-300 font-semibold text-teal-950 shadow-sm"
              : "text-teal-100 hover:bg-white/10 hover:text-amber-100"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

function SignedOutActions() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className={LOGIN_CLASS}>Login</Link>
      <Link href="/register" className={REGISTER_CLASS}>Register</Link>
    </div>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Everything derived from a client-only store (the URL via usePathname,
  // the session via localStorage) is deferred until after hydration. The
  // prerendered HTML — and the Suspense fallback on routes where
  // `usePathname` suspends (/books/[id]) — is always signed-out with no
  // active link, so the first client render must match that exactly or
  // hydration fails. See the usePathname docs under "Avoid hydration
  // mismatch".
  const [activePath, setActivePath] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    // URL and localStorage are external stores: sync after mount, the
    // pattern the Next.js usePathname docs prescribe under "Avoid
    // hydration mismatch".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivePath(pathname)
    setMounted(true)
  }, [pathname])

  // Before mount: mirror NavbarFallback (signed out, public links only).
  const links = mounted && user ? [...publicLinks, ...privateLinks] : publicLinks

  return (
    <header className={HEADER_CLASS}>
      <div className={INNER_CLASS}>
        <Logo className="text-white" />

        <NavLinks links={links} pathname={activePath} />

        <div className="flex items-center gap-2">
          {mounted && user ? (
            <UserMenu user={user} onProfile={() => router.push("/profile")} onLogout={logout} />
          ) : (
            <SignedOutActions />
          )}
        </div>
      </div>
    </header>
  )
}

function UserMenu({
  user,
  onProfile,
  onLogout,
}: {
  user: User
  onProfile: () => void
  onLogout: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Avatar>
          <AvatarImage src={user.photo || undefined} alt={user.name} />
          <AvatarFallback className="bg-[#244c52] text-white">
            <UserRoundIcon aria-hidden="true" className="size-4" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate text-sm font-medium text-foreground">
              {user.name}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onProfile}>
            <UserIcon />
            My Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onLogout}>
          <LogOutIcon />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * An exact copy of `Navbar`'s first render (signed out, no active link yet).
 *
 * On routes with dynamic params that are not prerendered, `usePathname`
 * suspends, so the layout commits this fallback into the server HTML instead
 * of the real header. The client renders `Navbar` immediately — if the two
 * differ, hydration fails — so every shared piece above is literal here.
 */
export function NavbarFallback() {
  return (
    <header className={HEADER_CLASS}>
      <div className={INNER_CLASS}>
        <Logo className="text-white" />
        <NavLinks links={publicLinks} pathname={null} />
        <div className="flex items-center gap-2">
          <SignedOutActions />
        </div>
      </div>
    </header>
  )
}
