import Link from "next/link"
import { BookOpenIcon } from "lucide-react"
import { cn } from "cn"

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="BookNook home"
      className={cn("flex shrink-0 items-center gap-2", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-amber-300 text-teal-950 shadow-sm shadow-black/10">
        <BookOpenIcon className="size-4" />
      </span>
      <span className="text-lg font-semibold tracking-tight">BookNook</span>
    </Link>
  )
}
