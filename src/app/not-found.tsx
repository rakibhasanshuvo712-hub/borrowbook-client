import Link from "next/link"
import { BookXIcon } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <BookXIcon className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-6xl font-semibold tracking-tight">404</p>
        <h1 className="mt-2 text-xl font-medium">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you were looking for has been moved, deleted, or never
          existed. Let&apos;s get you back to the shelves.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
