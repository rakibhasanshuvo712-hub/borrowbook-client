"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOutIcon, UserIcon } from "lucide-react"
import { cn } from "cn"
import { getInitials } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/all-books", label: "All Books" },
] as const

const privateLinks = [
  { href: "/add-book", label: "Add Book" },
  { href: "/my-books", label: "My Books" },
  { href: "/my-borrows", label: "My Borrows" },
] as const

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const links = user ? [...publicLinks, ...privateLinks] : publicLinks

  return (
    <header className="sticky top-0 z-40 border-b border-teal-900/20 bg-teal-700/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Logo className="text-white" />

        <nav
          aria-label="Main navigation"
          className="order-last flex w-full flex-wrap items-center gap-1 sm:order-none sm:w-auto"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                isActive(pathname, link.href) ? "page" : undefined
              }
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isActive(pathname, link.href)
                  ? "bg-white/20 font-medium text-white"
                  : "text-teal-100 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Open user menu"
                className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Avatar>
                  <AvatarImage src={user.photo} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block truncate text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <UserIcon />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                  <LogOutIcon />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className:
                    "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
                })}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={buttonVariants({
                  variant: "default",
                  size: "sm",
                  className: "bg-white text-teal-800 hover:bg-teal-50",
                })}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
